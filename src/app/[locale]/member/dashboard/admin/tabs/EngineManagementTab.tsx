import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check, X, GitMerge } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface Engine {
    id: number;
    name: string;
    status: 'PENDING' | 'APPROVED';
    createdAt: string;
    updatedAt: string;
}

export function EngineManagementTab() {
    const [engines, setEngines] = useState<Engine[]>([]);
    const [approvedEngines, setApprovedEngines] = useState<Engine[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Merge Dialog State
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
    const [engineToMerge, setEngineToMerge] = useState<Engine | null>(null);
    const [targetEngineId, setTargetEngineId] = useState<string>("");

    const fetchPendingEngines = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/engines?status=PENDING`);
            if (!res.ok) throw new Error('Failed to fetch pending engines');
            
            const data = await res.json();
            const items = Array.isArray(data) ? data : (data.data || []);
            setEngines(items);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load pending engines');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchApprovedEngines = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/engines?status=APPROVED`);
            if (res.ok) {
                const data = await res.json();
                const items = Array.isArray(data) ? data : (data.data || []);
                setApprovedEngines(items);
            }
        } catch (err) {
            console.error('Failed to fetch approved engines', err);
        }
    }, []);

    useEffect(() => {
        fetchPendingEngines();
        fetchApprovedEngines();
    }, [fetchPendingEngines, fetchApprovedEngines]);

    const handleApprove = async (id: number) => {
        try {
            setActionLoading(id);
            const token = Cookies.get('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/engines/${id}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error('Failed to approve engine');
            
            toast.success('Engine approved successfully');
            setEngines(prev => prev.filter(e => e.id !== id));
            // Refresh approved engines list so it's available for merge
            fetchApprovedEngines();
        } catch (err) {
            console.error(err);
            toast.error('Failed to approve engine');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject and delete this engine?')) return;
        
        try {
            setActionLoading(id);
            const token = Cookies.get('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/engines/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to reject engine');
            
            toast.success('Engine rejected successfully');
            setEngines(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
            toast.error('Failed to reject engine');
        } finally {
            setActionLoading(null);
        }
    };

    const openMergeDialog = (engine: Engine) => {
        setEngineToMerge(engine);
        setTargetEngineId("");
        setMergeDialogOpen(true);
    };

    const handleMerge = async () => {
        if (!engineToMerge || !targetEngineId) return;

        try {
            setActionLoading(engineToMerge.id);
            setMergeDialogOpen(false);
            
            const token = Cookies.get('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/engines/${engineToMerge.id}/merge`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetId: parseInt(targetEngineId) })
            });

            if (!res.ok) throw new Error('Failed to merge engine');
            
            toast.success(`Engine merged into ${approvedEngines.find(e => e.id === parseInt(targetEngineId))?.name || 'target'}`);
            setEngines(prev => prev.filter(e => e.id !== engineToMerge.id));
        } catch (err) {
            console.error(err);
            toast.error('Failed to merge engine');
        } finally {
            setActionLoading(null);
            setEngineToMerge(null);
            setTargetEngineId("");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Engine Management</CardTitle>
                <CardDescription>Review and approve pending game engines.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : engines.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                        No pending engines to review.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {engines.map((engine) => (
                                <TableRow key={engine.id}>
                                    <TableCell>{engine.id}</TableCell>
                                    <TableCell className="font-medium">{engine.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                            {engine.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(engine.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleApprove(engine.id)}
                                            disabled={actionLoading === engine.id}
                                            title="Approve Engine"
                                        >
                                            {actionLoading === engine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => openMergeDialog(engine)}
                                            disabled={actionLoading === engine.id}
                                            title="Merge into another engine"
                                        >
                                            {actionLoading === engine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
                                            <span className="ml-1 hidden sm:inline">Merge</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleReject(engine.id)}
                                            disabled={actionLoading === engine.id}
                                            title="Reject and Delete Engine"
                                        >
                                            {actionLoading === engine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Merge Engine</DialogTitle>
                        <DialogDescription>
                            Transfer all articles from <strong>{engineToMerge?.name}</strong> to an existing approved engine.
                            The engine <strong>{engineToMerge?.name}</strong> will be permanently deleted after merging.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <label className="block text-sm font-medium mb-2">Select Target Engine</label>
                        <Select value={targetEngineId} onValueChange={setTargetEngineId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an approved engine..." />
                            </SelectTrigger>
                            <SelectContent>
                                {approvedEngines.map(e => (
                                    <SelectItem key={e.id} value={e.id.toString()}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={handleMerge} 
                            disabled={!targetEngineId}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Confirm Merge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
