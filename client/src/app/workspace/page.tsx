'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { FileTree } from './filetree';
import { ContentEditor } from './contenteditor';
import ProtectedRoute from '../auth/ProtectedRoute';
import { Button} from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';


interface ScrapedContent {
  file_tree: Record<string, any>;
  content: Record<string, string>;
}

export default function WorkspacePage() {
    const router = useRouter();
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [fileTree, setFileTree] = useState<Record<string, any>>({});
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [message, setMessage] = useState('');
  const [team, setTeam] = useState<{ id:string; admin: string; members: string[] } | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  


  const handleAddUrl = async () => {
    if (!currentUrl || urls.includes(currentUrl)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/scrape', { url: currentUrl });
      const scrapedData: ScrapedContent = response.data;

      // Merge new content with existing
      setUrls(prev => [...prev, currentUrl]);
      setFileTree(prev => ({
        ...prev,
        [new URL(currentUrl).hostname]: scrapedData.file_tree
      }));
      setContentMap(prev => ({
        ...prev,
        ...scrapedData.content
      }));

      setCurrentUrl('');
    } catch (err) {
      setError('Failed to scrape website. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (fileKey: string) => {
    // Deselect if the same file is clicked again
    setSelectedFile(prev => prev === fileKey ? null : fileKey);
  };

  const handleContentChange = (newContent: string) => {
    if (selectedFile) {
      setContentMap(prev => ({
        ...prev,
        [selectedFile]: newContent
      }));
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const createTeam = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/create_team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ team_id: teamId }),
      });
      const data = await response.json();
  
      setMessage(data.message || data.error);
  
      if (!data.error) {
        setTeamId('');
        setIsCreateModalOpen(false);
  
        // Fetch the created team details
        const teamResponse = await fetch(`http://127.0.0.1:5000/team/${teamId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const teamData = await teamResponse.json();
        if (!teamData.error) {
          setTeam(teamData.team);
        }
      }
    } catch {
      setMessage('An error occurred while creating the team.');
    }
  };


  const fetchAvailableTeams = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/teams/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.error) {
        setMessage(data.error);
        return;
      }

      // Assuming `data.teams` is the list of available team IDs
      setAvailableTeams(data.team || []);
      
     

    } catch {
      setMessage("An error occurred while fetching the available teams.");
    }
  };

  const joinTeam = async () => {
    if (!selectedTeamId) {
      setMessage("Please select a team to join.");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/join_team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ team_id: selectedTeamId }),
      });
  
      const data = await response.json();
  
      setMessage(data.message || data.error);
  
      if (!data.error) {
        setIsJoinModalOpen(false);
        setSelectedTeamId(null);
  
        // Fetch the updated team details after joining
        const teamResponse = await fetch(`http://127.0.0.1:5000/team/${selectedTeamId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        const teamData = await teamResponse.json();
        if (!teamData.error) {
          setTeam(teamData.team); 
        }
      }
    } catch {
      setMessage("An error occurred while joining the team.");
    }
  };
  
  

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Input 
          type="text"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          placeholder="Enter website URL to scrape"
          className="flex-grow"
        />
        <Button 
          onClick={handleAddUrl} 
          disabled={loading}
          variant={loading ? "outline" : "default"}
        >
          {loading ? 'Scraping...' : 'Scrape'}
        </Button>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>

      {team ? (
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Team ID: {team.id}</p>
            <div className="mt-2">
              <h4 className="font-medium">Team Members:</h4>
              <ul className="space-y-1 text-muted-foreground">
                {team.members.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex space-x-4">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create New Team
          </Button>
          <Button 
            onClick={() => {
              setIsJoinModalOpen(true);
              fetchAvailableTeams();
            }}
          >
            Join Existing Team
          </Button>
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Team</DialogTitle>
            <DialogDescription>
              Enter a unique team ID to create your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter Team ID"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
            <Button onClick={createTeam} className="w-full">
              Create Team
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </DialogContent>
      </Dialog>

     
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join an Existing Team</DialogTitle>
            <DialogDescription>
              Select a team to join from the available list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableTeams ? (
              <div className="grid gap-2">
                {Object.keys(availableTeams).map((id) => (
                  <Button
                    key={id}
                    variant={selectedTeamId === id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTeamId(id);
                      setTeamId(id);
                    }}
                  >
                    {id}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No available teams to join.</p>
            )}
            <Button onClick={joinTeam} className="w-full">
              Join Team
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </DialogContent>
      </Dialog>

   
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground p-3 rounded">
          {error}
        </div>
      )}

      
      <Card>
        <CardHeader>
          <CardTitle>Scraped URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {urls.map(url => (
              <div 
                key={url} 
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded"
              >
                {url}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
     

  
      <div className="flex flex-grow overflow-hidden"> 
        <div className="w-1/3 border-r overflow-y-auto">
          <FileTree 
            tree={fileTree} 
            onSelectFile={handleFileSelect}
            selectedFile={selectedFile}
          />
        </div>

        <div className="w-2/3 p-4">
          {selectedFile ? (
            <ContentEditor 
              key={selectedFile}
              content={contentMap[selectedFile] || ''} 
              onContentChange={handleContentChange}
            />
          ) : (
            <div className="text-center text-gray-500">
              Select a file to edit
            </div>
          )}
        </div>
      </div>
    
    </ProtectedRoute>
  );
}