export default function About() {
  return (
    <main className="about-container">
      <section className="about-section">
        <h1>About Me</h1>
        
        <div className="about-content">
          <p>
            Welcome to the Wildfire Data Dashboard! This project is designed to help manage and 
            monitor wildfire dispatch areas and Fire Danger Rating Area (FDRA) data.
          </p>
          
          <h2>Project Purpose</h2>
          <p>
            This dashboard provides a centralized platform for tracking dispatch areas and FDRA records,
            allowing users to easily add, view, and manage wildfire-related data in real-time.
          </p>
          
          <h2>Features</h2>
          <ul>
            <li>Add and manage dispatch areas</li>
            <li>Track FDRA data including Build Index (BI) and Energy Release Component (ERC)</li>
            <li>Real-time connection status monitoring</li>
            <li>User-friendly form interface</li>
          </ul>
          
          <h2>Technology Stack</h2>
          <ul>
            <li>Next.js - React framework</li>
            <li>Supabase - Database and backend</li>
            <li>React Hooks - State management</li>
          </ul>
        </div>
      </section>
    </main>
  );
}