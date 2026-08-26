/**
 * Educational Implementation of Dijkstra's Algorithm
 * 
 * This file demonstrates a shortest-path routing algorithm.
 * Note: MapMate uses OpenRouteService for real-world road routing.
 * This implementation serves as an engineering demonstration of how
 * core routing algorithms function on a graph structure.
 */

// Represents an edge between two nodes with a specific weight (distance/cost)
export interface Edge {
  node: string;
  weight: number;
}

// Represents the graph as an adjacency list
export interface Graph {
  [node: string]: Edge[];
}

/**
 * Calculates the shortest path between a start node and an end node.
 * @param graph The graph representing the road network
 * @param startNode The starting location ID
 * @param endNode The destination location ID
 * @returns An object containing the shortest path array and the total distance
 */
export function dijkstra(graph: Graph, startNode: string, endNode: string): { path: string[], distance: number } {
  const distances: { [node: string]: number } = {};
  const previous: { [node: string]: string | null } = {};
  const queue = new Set<string>();

  // Initialize distances to Infinity, and add all nodes to the queue
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
    queue.add(node);
  }
  
  distances[startNode] = 0;

  while (queue.size > 0) {
    // Find the unvisited node with the smallest distance
    let minDistance = Infinity;
    let closestNode: string | null = null;

    for (const node of queue) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        closestNode = node;
      }
    }

    if (closestNode === null) break;
    
    // If we've reached the destination, we can stop early
    if (closestNode === endNode) break;

    queue.delete(closestNode);

    // Update distances to neighboring nodes
    if (graph[closestNode]) {
      for (const neighbor of graph[closestNode]) {
        if (!queue.has(neighbor.node)) continue;

        const alternativeRoute = distances[closestNode] + neighbor.weight;
        
        if (alternativeRoute < distances[neighbor.node]) {
          distances[neighbor.node] = alternativeRoute;
          previous[neighbor.node] = closestNode;
        }
      }
    }
  }

  // Backtrack to find the shortest path
  const path: string[] = [];
  let currentNode: string | null = endNode;

  if (previous[endNode] !== undefined || startNode === endNode) {
    while (currentNode) {
      path.unshift(currentNode);
      currentNode = previous[currentNode];
    }
  }

  return {
    path,
    distance: distances[endNode] === Infinity ? -1 : distances[endNode]
  };
}
