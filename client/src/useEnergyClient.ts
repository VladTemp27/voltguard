import { useState, useEffect, useRef } from 'react';
import { Client } from '@modelcontextprotocol/sdk/client/index';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse';  

// Define the shape of a Tool for TypeScript (optional but helpful)
interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export const useEnergyClient = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Use a ref to keep the client instance stable across renders
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        addLog("🔌 Connecting to Energy Server...");

        // 1. Point to your Python Server's SSE endpoint
        // NOTE: matches the URL you successfully visited in the browser
        const transport = new SSEClientTransport(
          new URL("http://localhost:8000/lou/mcp/sse")
        );

        // 2. Initialize Client
        clientRef.current = new Client(
          { name: "VoltGuard-React", version: "1.0.0" },
          { capabilities: { tools: {} } }
        );

        // 3. Start the connection
        await clientRef.current.connect(transport);
        setIsConnected(true);
        addLog("✅ Connected via SSE!");

        // 4. Ask server: "What tools do you have?"
        const result = await clientRef.current.listTools();
        setTools(result.tools);
        addLog(`🛠️ Discovered ${result.tools.length} tools`);

      } catch (error) {
        console.error(error);
        addLog(`❌ Connection Failed: ${error}`);
      }
    };

    connect();

    // Cleanup: Close connection when component unmounts
    return () => {
      clientRef.current?.close();
    };
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // Wrapper to execute a tool
  const executeTool = async (toolName: string, args: any) => {
    if (!clientRef.current) return;
    
    addLog(`🤖 Requesting tool: ${toolName}...`);
    try {
      const result = await clientRef.current.callTool({
        name: toolName,
        arguments: args
      });
      
      // The result usually comes back as a content array
      // We grab the text from the first item
      const output = result.content[0].text; 
      addLog("✅ Result received.");
      return output;
    } catch (err) {
      addLog(`❌ Error executing tool: ${err}`);
      throw err;
    }
  };

  return { isConnected, tools, executeTool, logs };
};