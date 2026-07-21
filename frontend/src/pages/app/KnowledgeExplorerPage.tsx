import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Expand, Maximize2, Zap, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';



const COLOR_MAP: Record<string, string> = {
  Equipment: '#3b82f6', // blue-500
  Incident: '#ef4444', // red-500
  Document: '#10b981', // emerald-500
  Standard: '#8b5cf6', // violet-500
  Person: '#f59e0b', // amber-500
  Risk: '#f97316', // orange-500
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Equipment: <Zap size={16} className="text-blue-500" />,
  Incident: <AlertTriangle size={16} className="text-red-500" />,
  Document: <Expand size={16} className="text-emerald-500" />,
  Standard: <Shield size={16} className="text-violet-500" />,
  Risk: <AlertTriangle size={16} className="text-orange-500" />
};

export function KnowledgeExplorerPage() {
  const { theme } = useUIStore();
  const fgRef = useRef<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState<{nodes: any[], links: any[]}>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const { apiClient } = await import('../../services/apiClient');
        const res = await apiClient.get('/graph');
        if (res.status === 200) {
          setGraphData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch graph data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraph();
  }, []);
  
  // Responsive Graph
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions(); // Init
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter Data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return graphData;
    const lowerQuery = searchQuery.toLowerCase();
    
    const nodes = graphData.nodes.filter(
      n => n.id.toLowerCase().includes(lowerQuery) || n.group.toLowerCase().includes(lowerQuery)
    );
    
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(
      l => nodeIds.has(l.source) && nodeIds.has(l.target)
    );
    
    return { nodes, links };
  }, [searchQuery, graphData]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    
    if (fgRef.current) {
      // Zoom into node
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(3, 1000);
    }
  }, []);

  const resetView = () => {
    setSelectedNode(null);
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header Toolbar */}
      <div className="flex-none p-4 border-b border-[var(--border-secondary)] bg-[var(--surface-primary)] flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Knowledge Explorer</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Interactive Industrial Intelligence Graph</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search entities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent text-[var(--text-primary)] w-64 transition-all"
            />
          </div>
          <button className="p-2 border border-[var(--border-secondary)] rounded-full hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]">
            <Filter size={16} />
          </button>
          <button onClick={resetView} className="p-2 border border-[var(--border-secondary)] rounded-full hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]" title="Reset View">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Graph Container */}
        <div id="graph-container" className="flex-1 bg-[var(--bg-secondary)] relative">
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={filteredData}
            nodeLabel="id"
            nodeColor={(node: any) => COLOR_MAP[node.group as string] || '#94a3b8'}
            nodeRelSize={6}
            linkColor={() => isDark ? '#334155' : '#cbd5e1'}
            linkWidth={(link: any) => link.value}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            onNodeHover={setHoverNode}
            onNodeClick={handleNodeClick}
            backgroundColor={isDark ? '#020617' : '#f8fafc'} // match bg-slate-950 / bg-slate-50
            nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
              const label = node.id;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Inter, sans-serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

              ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 - 10, bckgDimensions[0], bckgDimensions[1]);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = COLOR_MAP[node.group as string] || (isDark ? '#f8fafc' : '#0f172a');
              ctx.fillText(label, node.x, node.y - 10);
              
              // Draw Circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.size / 3, 0, 2 * Math.PI, false);
              ctx.fillStyle = COLOR_MAP[node.group as string] || '#94a3b8';
              ctx.fill();
              
              // Highlight if selected
              if (node === selectedNode) {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }
            }}
          />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 p-4 rounded-xl bg-[var(--surface-glass)] backdrop-blur-md border border-[var(--glass-border)] shadow-xl flex flex-col gap-2">
             <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Entity Types</h4>
             {Object.entries(COLOR_MAP).map(([type, color]) => (
               <div key={type} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                 {type}
               </div>
             ))}
          </div>
        </div>

        {/* Info Panel Sidebar */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-96 flex-none bg-[var(--surface-primary)] border-l border-[var(--border-secondary)] overflow-y-auto shadow-2xl relative z-20"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {ICON_MAP[selectedNode.group] || <CheckCircle size={16} className="text-gray-500" />}
                      <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: COLOR_MAP[selectedNode.group] }}>
                        {selectedNode.group}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{selectedNode.id}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
                  {selectedNode.description || 'No description available for this entity.'}
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-2 mb-4">Properties</h3>
                    <div className="bg-[var(--surface-secondary)] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Confidence Score</span>
                        <span className="text-[var(--success)] font-mono">98.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Extracted From</span>
                        <span className="text-[var(--text-primary)] underline decoration-dashed">Doc_592.pdf</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Last Updated</span>
                        <span className="text-[var(--text-primary)]">Just now</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-2 mb-4">Connections ({graphData.links.filter((l: any) => l.source === selectedNode.id || l.target === selectedNode.id).length})</h3>
                    <div className="space-y-2">
                      {graphData.links
                        .filter((l: any) => l.source === selectedNode.id || l.target === selectedNode.id)
                        .map((link: any, idx: number) => {
                          const isSource = link.source === selectedNode.id;
                          const connectedId = isSource ? link.target : link.source;
                          const connectedNode = graphData.nodes.find((n: any) => n.id === connectedId);
                          
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-primary)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer" onClick={() => handleNodeClick(connectedNode)}>
                              <div className="flex-none p-2 rounded-md bg-[var(--surface-secondary)] text-[var(--text-muted)]">
                                {isSource ? '→' : '←'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{link.label}</p>
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{connectedId as string}</p>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-[var(--shadow-soft)]">
                    Explore Deep Path
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
