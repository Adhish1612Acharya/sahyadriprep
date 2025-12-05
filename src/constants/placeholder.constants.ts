export const demoInterviewExperience = {
  name: "e.g., Jhon doe",
  branch: "e.g., CSE",
  batch: "e.g., 2025",
  email: "e.g., your-email@sahyadri.edu.in",
  linkedin: "e.g.,https://linkedin.com/in/your-profile",
  company: "e.g., MRI",
  role: "e.g., Software Engineer",
  placementType: "e.g., Full-Time" as const,
  package: "e.g.,10 LPA",
  rounds: [
    {
      roundTitle: "e.g., Online Assessment",
      difficulty: "e.g., Medium" as const,
      description:
        "e.g., The online assessment consisted of three coding questions focused on data structures and algorithms. The first question was based on arrays and required optimizing for time complexity. The second was a string manipulation problem, and the third was a dynamic programming challenge. There were also 10 multiple-choice questions on computer science fundamentals, including operating systems, DBMS, and networking.",
    },
    {
      roundTitle: "e.g., Technical Interview",
      difficulty: "e.g., Hard" as const,
      description:
        "e.g., The technical interview started with a deep dive into my resume projects, followed by several DSA problems. I was asked to implement a binary search tree and explain its time complexities. The interviewer also asked about system design, specifically designing a scalable URL shortener. There were follow-up questions on database normalization and REST API best practices.",
    },
    {
      roundTitle: "e.g., HR Interview",
      difficulty: "e.g., Easy" as const,
      description:
        "e.g., The HR round was conversational. I was asked about my motivation for joining Google, how I handle stress, and examples of teamwork from my college days. There were also situational questions like how I would resolve conflicts in a team and what I expect from my manager.",
    },
  ],
  projectDiscussion:
    "e.g., My final year project was an AI-based attendance system using facial recognition. I explained the tech stack (Python, OpenCV, TensorFlow), the challenges faced in real-time face detection, and how we ensured data privacy. The interviewer was interested in the deployment process and how we handled edge cases like identical twins or poor lighting conditions. I also discussed the impact of the project in reducing manual errors and improving attendance accuracy.",
  resumeDiscussion:
    "e.g., We discussed my two internships: one at a startup where I built a microservice for image processing, and another at a large IT firm where I contributed to a React-based dashboard. The interviewer asked about my open-source contributions, specifically a pull request I made to a popular JavaScript library. I was also asked to justify some of the skills listed on my resume, like Docker and Kubernetes, with real-world examples.",
  tipsForJuniors:
    "e.g., Start preparing early and be consistent with your DSA practice. Use platforms like LeetCode and Codeforces. Build at least one solid project and be ready to discuss it in depth. Participate in hackathons and coding contests to improve problem-solving skills. During interviews, communicate your thought process clearly. Don't be afraid to ask clarifying questions. For HR rounds, be honest and show your enthusiasm for learning. Mock interviews with friends or mentors can boost your confidence. Finally, always review your resume and be prepared to discuss every point.",
};