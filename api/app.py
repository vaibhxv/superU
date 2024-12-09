from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
from flask_socketio import SocketIO, emit
import hashlib

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = 'mysecretpvtkey'  
jwt = JWTManager(app)


CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Simulated in-memory database
users = []
files = {}
teams = {}

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if any(user['email'] == email for user in users):
        return jsonify({"message": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    users.append({"email": email, "password": hashed_password})
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = next((user for user in users if user['email'] == email), None)

    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify({"token": access_token}), 200

@app.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    current_user = get_jwt_identity()
    return jsonify({"valid": True, "email": current_user}), 200



def generate_unique_key(text):
    """Generate a unique key for each content piece."""
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def scrape_website(url):
    try:
       
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        file_tree = {}
        content_map = {}

        def process_content(element, path=''):
            if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']:
                text = element.get_text(strip=True)
           
                if not text:
                    return

                key = generate_unique_key(text)
                content_map[key] = text

                current_level = file_tree
                path_parts = path.split('/')[1:]
                
                for part in path_parts:
                    if part not in current_level:
                        current_level[part] = {}
                    current_level = current_level[part]
    
                current_level[f"{element.name}_{key[:8]}"] = key

            if hasattr(element, 'children'):
                for child in element.children:
                    if hasattr(child, 'name') and child.name:
                        new_path = f"{path}/{child.name}"
                        process_content(child, new_path)

        process_content(soup.body)

        return {
            'file_tree': file_tree,
            'content': content_map
        }

    except Exception as e:
        return {'error': str(e)}

@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    result = scrape_website(url)
    return jsonify(result)

@app.route('/create_team', methods=['POST'])
@jwt_required()
def create_team():
    current_user = get_jwt_identity()
    data = request.json
    team_id = data.get('team_id')

    if not team_id:
        return jsonify({"error": "Team ID is required"}), 400

    if team_id in teams:
        return jsonify({"error": "Team already exists"}), 409

    teams[team_id] = {'id': team_id,'admin': current_user, 'members': [current_user]}
    return jsonify({'message': f'Team {team_id} created successfully'}), 201

@app.route('/team/<team_id>', methods=['GET'])
@jwt_required()
def get_team(team_id):
    if team_id not in teams:
        return jsonify({'error': 'Team not found'}), 404

    return jsonify({'team': teams[team_id]}), 200

@app.route('/teams/all', methods=['GET'])
def get_all_teams():
    return jsonify({'team': teams}), 200

@app.route('/join_team', methods=['POST'])
@jwt_required()
def join_team():
    current_user = get_jwt_identity()
    data = request.json
    team_id = data.get('team_id')

    if not team_id:
        return jsonify({'error': 'Team ID is required'}), 400

    if team_id not in teams:
        return jsonify({'error': 'Team not found'}), 404

    if current_user in teams[team_id]['members']:
        return jsonify({'error': 'User already a member of this team'}), 409

    teams[team_id]['members'].append(current_user)
    return jsonify({'message': f'User {current_user} joined team {team_id} successfully'}), 200


@app.route('/invite', methods=['POST'])
@jwt_required()
def invite_member():
    current_user = get_jwt_identity()
    data = request.json
    team_id = data.get('team_id')
    email = data.get('email')

    if team_id not in teams:
        return jsonify({'error': 'Team not found'}), 404

    if current_user != teams[team_id]['admin']:
        return jsonify({'error': 'Only the admin can invite members'}), 403

    teams[team_id]['members'].append(email)
    return jsonify({'message': f'{email} invited to team {team_id}'}), 200


@socketio.on('edit_content')
def handle_edit(data):
    team_id = data['team_id']
    path = data['path']
    new_content = data['content']

 
    if team_id in teams:
        files[team_id] = files.get(team_id, {})
        files[team_id][path] = new_content

        emit('update_content', {'team_id': team_id, 'path': path, 'content': new_content}, room=team_id)
    else:
        emit('error', {'message': 'Invalid team ID'}, to=request.sid)



if __name__ == '__main__':
    app.run(debug=True)