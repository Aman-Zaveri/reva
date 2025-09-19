import type { DataBundle } from './types';

export const data: DataBundle = {
  personalInfo: {
    fullName: 'Your Name',
    email: 'your.email@domain.com',
    phone: '(555) 123-4567',
    location: 'City, State',
    linkedin: 'linkedin.com/in/yourname',
    github: 'github.com/username',
    website: 'yourwebsite.com',
    summary: 'Your professional summary here'
  },
  
  experiences: [
    {
      id: 'experience-1',
      title: 'Software Engineer',
      company: 'Tech Company',
      date: '2023 - Present',
      bullets: [
        'Built scalable web applications using modern frameworks',
        'Collaborated with cross-functional teams to deliver features',
        'Improved system performance and user experience'
      ],
      tags: ['JavaScript', 'React', 'Node.js']
    },
    {
      id: 'experience-2',
      title: 'Junior Developer',
      company: 'Previous Company',
      date: '2022 - 2023',
      bullets: [
        'Developed responsive web interfaces',
        'Participated in code reviews and testing',
        'Learned industry best practices'
      ],
      tags: ['HTML', 'CSS', 'JavaScript']
    }
  ],
  
  projects: [
    {
      id: 'project-1',
      title: 'Portfolio Website',
      link: 'github.com/username/portfolio',
      bullets: [
        'Built personal portfolio using React and TypeScript',
        'Implemented responsive design and modern UI',
        'Deployed using CI/CD pipeline'
      ],
      tags: ['React', 'TypeScript', 'CSS']
    },
    {
      id: 'project-2',
      title: 'Task Management App',
      link: 'github.com/username/tasks',
      bullets: [
        'Created full-stack task management application',
        'Integrated user authentication and data persistence',
        'Designed intuitive user interface'
      ],
      tags: ['Node.js', 'MongoDB', 'Express']
    }
  ],
  
  skills: [
    {
      id: 'languages',
      name: 'Languages',
      details: 'JavaScript, TypeScript, Python, Java'
    },
    {
      id: 'frameworks',
      name: 'Frameworks',
      details: 'React, Node.js, Express, Next.js'
    },
    {
      id: 'tools',
      name: 'Tools',
      details: 'Git, Docker, AWS, MongoDB, PostgreSQL'
    }
  ],
  
  education: [
    {
      id: 'degree-1',
      title: 'Bachelor of Computer Science',
      details: 'University Name • 2024'
    }
  ]
};