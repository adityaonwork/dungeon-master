
export interface RoadmapDay {
  day: number;
  quest: string;
  focus: string;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  dsa: string[];
  ai_ml: string[];
  fitness: string;
}

export const ROADMAP_WEEKS: RoadmapWeek[] = [
  {
    week: 1,
    title: "Foundation Awakening",
    dsa: ["Time Complexity", "Arrays Basics", "Input/Output", "Patterns", "Basic Math"],
    ai_ml: ["Python setup", "Variables", "Loops", "Functions", "Lists & Dictionaries"],
    fitness: "Mobility Focus + Brisk Walk (20 min)"
  },
  {
    week: 2,
    title: "Logic Builder",
    dsa: ["Strings", "Hashing", "Sliding basics", "Sorting intro"],
    ai_ml: ["OOP basics", "File handling", "Python modules", "Exception handling"],
    fitness: "Light Jogging Intervals + Push Split"
  },
  {
    week: 3,
    title: "Intermediate Core",
    dsa: ["Linked List", "Stack", "Queue", "Recursion Basics"],
    ai_ml: ["NumPy basics", "Arrays", "Matrix operations", "Data handling"],
    fitness: "McGill Big 3 (Spine Health) + Pull Split"
  },
  {
    week: 4,
    title: "Speed Arc",
    dsa: ["Binary Search", "Two Pointers", "Sliding Window", "Sorting Advanced"],
    ai_ml: ["Pandas", "CSV handling", "Data cleaning", "Filtering"],
    fitness: "Running (2-4 km) + V-Taper focus"
  },
  {
    week: 5,
    title: "Data Structures Expansion",
    dsa: ["Trees basics", "Binary Trees", "BST", "Traversals"],
    ai_ml: ["Matplotlib", "Data visualization", "Graphs/charts"],
    fitness: "Shoulder Width focus + Dead Hangs"
  },
  {
    week: 6,
    title: "Advanced Thinking",
    dsa: ["Heap", "Priority Queue", "Greedy Basics"],
    ai_ml: ["Machine Learning intro", "Supervised learning", "Dataset understanding"],
    fitness: "Running (3-4 km) + Posture holds"
  },
  {
    week: 7,
    title: "Graph Realm",
    dsa: ["Graphs", "BFS", "DFS", "Matrix traversal"],
    ai_ml: ["Linear Regression", "Model evaluation", "Accuracy concepts"],
    fitness: "McGill Big 3 + Upper Body Strength"
  },
  {
    week: 8,
    title: "Problem Solver Arc",
    dsa: ["Dynamic Programming basics", "Memoization", "Tabulation"],
    ai_ml: ["Classification", "Logistic Regression", "Scikit-learn basics"],
    fitness: "Running (4-5 km) target"
  },
  {
    week: 9,
    title: "Builder Phase",
    dsa: ["Mixed revision", "Contest practice", "Mock interviews"],
    ai_ml: ["End-to-end projects", "Data preprocessing", "Model training"],
    fitness: "V-Taper Foundation + Endurance"
  },
  {
    week: 10,
    title: "Deployment Arc",
    dsa: ["Weak topic revision", "Medium-level interview questions"],
    ai_ml: ["Streamlit basics", "Model deployment", "GitHub upload"],
    fitness: "Spine Recovery + Mobility"
  },
  {
    week: 11,
    title: "Shadow Monarch Week",
    dsa: ["Revision marathon", "Timed practice", "Interview-style solving"],
    ai_ml: ["Final Projects: Chatbot, Rec System, AI Assistant"],
    fitness: "5 KM Run + Legend Status"
  }
];

export const CORE_RULES = [
  "Rule 1: No Zero Days - even on bad days, do minimum progress.",
  "Rule 2: Library Mode - Target 7-8 productive hours in the library.",
  "Rule 3: Health First - Posture > Weight. No ego lifting.",
  "Rule 4: Dopamine Control - No mindless scrolling. High focus only."
];

export const DAILY_REHAB = [
  "Cat-cow stretches", "Bird dog", "Child pose", "Pelvic tilt", "Chin tuck", "Wall posture hold", "Hamstring stretch"
];
