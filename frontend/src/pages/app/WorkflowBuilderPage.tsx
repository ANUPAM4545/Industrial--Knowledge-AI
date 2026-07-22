import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useUIStore } from '../../store/uiStore';
import { Play, Save, Plus, Settings } from 'lucide-react';

const defaultNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'New PDF Upload' }, type: 'input' },
  { id: '2', position: { x: 350, y: 100 }, data: { label: 'OCR & Text Extraction' } },
  { id: '3', position: { x: 600, y: 100 }, data: { label: 'Entity Extraction (NER)' } },
  { id: '4', position: { x: 600, y: 250 }, data: { label: 'Knowledge Graph Insertion' } },
  { id: '5', position: { x: 850, y: 100 }, data: { label: 'Compliance Scan' } },
  { id: '6', position: { x: 1100, y: 175 }, data: { label: 'Notify Engineering Team' }, type: 'output' },
];

const defaultEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e3-5', source: '3', target: '5', animated: true },
  { id: 'e4-6', source: '4', target: '6', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true },
];

export function WorkflowBuilderPage() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  React.useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const { apiClient } = await import('../../services/apiClient');
        const res = await apiClient.get('/workflows');
        if (res.status === 200) {
          const data = res.data;
          if (data && data.length > 0) {
            // Load the first workflow
            const wf = data[0];
            if (wf.workflow_json && wf.workflow_json.nodes && wf.workflow_json.nodes.length > 0) {
              setNodes(wf.workflow_json.nodes);
              setEdges(wf.workflow_json.edges);
            } else {
              setNodes(defaultNodes);
              setEdges(defaultEdges);
            }
          } else {
              setNodes(defaultNodes);
              setEdges(defaultEdges);
          }
        }
      } catch (err) {
        console.error('Failed to load workflows', err);
        setNodes(defaultNodes);
        setEdges(defaultEdges);
      }
    };
    fetchWorkflows();
  }, []);

  const handleSave = async () => {
    try {
      const { apiClient } = await import('../../services/apiClient');
      const payload = {
        name: 'Default Pipeline',
        description: 'AI processing pipeline',
        is_active: true,
        workflow_json: { nodes, edges }
      };

      const res = await apiClient.post('/workflows/', payload);

      if (res.status === 201) {
        alert('Workflow saved successfully!');
      } else {
        alert('Failed to save workflow');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving workflow');
    }
  };


  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
      {/* Toolbar */}
      <div className="flex-none p-4 border-b border-[var(--border-secondary)] bg-[var(--surface-primary)] flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Workflow Automation</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Visually build AI pipelines</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium">
            <Plus size={16} />
            Add Node
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium">
            <Settings size={16} />
            Configure
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-opacity-90 transition-all text-sm font-medium shadow-[var(--shadow-soft)]">
            <Save size={16} />
            Save Workflow
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium shadow-[var(--shadow-soft)] ml-2">
            <Play size={16} />
            Test Run
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative" style={{ backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ width: '100%', height: '100%' }}
          className={`${isDark ? 'dark' : 'light'}`}
        >
          <Controls className="bg-[var(--surface-primary)] border border-[var(--border-secondary)] rounded-md shadow-lg" />
          <MiniMap 
            nodeColor={isDark ? '#3b82f6' : '#2563eb'}
            maskColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
            className="bg-[var(--surface-primary)] border border-[var(--border-secondary)] rounded-lg shadow-lg"
          />
          <Background color={isDark ? '#334155' : '#cbd5e1'} gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
