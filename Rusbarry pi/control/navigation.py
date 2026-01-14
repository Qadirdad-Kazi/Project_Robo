"""
Navigation Module - Mapping and Path Planning
=============================================

This module handles environment mapping and path planning.
It uses a simplified Grid Map representation and A* (A-Star) algorithm
to calculate routes around obstacles.
"""

import math
import heapq

class GridMap:
    """
    Represents the environment as a 2D grid.
    0 = Free space
    1 = Obstacle
    """
    def __init__(self, key="default", width=20, height=20, resolution=10):
        self.width = width
        self.height = height
        self.resolution = resolution # cm per cell
        self.grid = [[0 for _ in range(width)] for _ in range(height)]
        print(f"Navigation: Initialized GridMap {width}x{height} ({resolution} cm/cell)")

    def update_obstacle(self, x, y):
        """Marks a cell as an obstacle given world coordinates."""
        grid_x = int(x / self.resolution)
        grid_y = int(y / self.resolution)
        if 0 <= grid_x < self.width and 0 <= grid_y < self.height:
            self.grid[grid_y][grid_x] = 1
            print(f"Map: Obstacle detected at ({x}, {y}) -> Grid[{grid_x}, {grid_y}]")

    def is_blocked(self, grid_x, grid_y):
        if 0 <= grid_x < self.width and 0 <= grid_y < self.height:
            return self.grid[grid_y][grid_x] == 1
        return True # Out of bounds is blocked

class PathPlanner:
    """
    Implements A* Pathfinding logic.
    """
    def __init__(self, grid_map):
        self.map = grid_map

    def heuristic(self, a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1]) # Manhattan distance

    def find_path(self, start, goal):
        """
        Calculates a path from start (x, y) to goal (x, y) in world coords.
        Returns a list of waypoints.
        """
        # Convert to grid coords
        start_node = (int(start[0]/self.map.resolution), int(start[1]/self.map.resolution))
        goal_node = (int(goal[0]/self.map.resolution), int(goal[1]/self.map.resolution))
        
        print(f"Navigation: Planning path from {start_node} to {goal_node}...")
        
        frontier = []
        heapq.heappush(frontier, (0, start_node))
        came_from = {}
        cost_so_far = {}
        came_from[start_node] = None
        cost_so_far[start_node] = 0
        
        while frontier:
            current = heapq.heappop(frontier)[1]
            
            if current == goal_node:
                break
            
            # Neighbors (Up, Down, Left, Right)
            neighbors = [
                (current[0]+1, current[1]), (current[0]-1, current[1]),
                (current[0], current[1]+1), (current[0], current[1]-1)
            ]
            
            for next_node in neighbors:
                if not self.map.is_blocked(next_node[0], next_node[1]):
                    new_cost = cost_so_far[current] + 1
                    if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                        cost_so_far[next_node] = new_cost
                        priority = new_cost + self.heuristic(goal_node, next_node)
                        heapq.heappush(frontier, (priority, next_node))
                        came_from[next_node] = current
                        
        if goal_node not in came_from:
            print("Navigation: No path found!")
            return None
            
        # Reconstruct path
        path = []
        curr = goal_node
        while curr != start_node:
            path.append(curr)
            curr = came_from[curr]
        path.append(start_node)
        path.reverse()
        
        print(f"Navigation: Path found with {len(path)} steps.")
        return path

class Navigator:
    """
    High-level navigation manager.
    Integration point for SLAM (Simultaneous Localization and Mapping).
    """
    def __init__(self, robot_mover, sensors):
        self.mover = robot_mover
        self.sensors = sensors
        self.map = GridMap()
        self.planner = PathPlanner(self.map)
        self.current_pos = (0, 0) # Assuming start at 0,0
        
    def scan_and_map(self):
        """
        Uses sensors to update the map.
        Simulates adding obstacles if sensors detect something.
        """
        if not self.sensors.check_path_clear():
            # Obstacle ahead, map it relative to current pos
            # For simplicity, assume obstacle is 20cm ahead
            obs_x = self.current_pos[0] + 20
            obs_y = self.current_pos[1]
            self.map.update_obstacle(obs_x, obs_y)

    def go_to(self, x, y):
        """
        Plans and executes movement to target (x, y).
        """
        path = self.planner.find_path(self.current_pos, (x, y))
        if path:
            # Execute path (mock execution)
            for node in path:
                print(f"Navigating to grid cell {node}...")
                self.mover.move_forward(speed=0.5)
                # In real code: wait for odometry/encoder feedback
                # self.current_pos = (node[0]*resolution, node[1]*resolution)
        else:
            print("Navigation: Cannot reach target.")

