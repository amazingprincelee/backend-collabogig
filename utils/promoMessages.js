/**
 * This file contains various promotional message templates for upgrade emails
 * These templates will be rotated to provide variety in promotional communications
 */

// Collection of promotional message templates for upgrade emails
export const upgradePromoTemplates = [
  {
    subject: "Upgrade Your Learning Experience with Code-Fast Premium",
    title: "Take Your Skills to the Next Level",
    intro: "We hope you're enjoying the free web development course! Ready to unlock the full potential of your learning journey? Upgrade to our premium today and enjoy these exclusive benefits:",
    benefits: [
      "<strong>One-on-One Mentorship</strong> - Get personalized guidance from us",
      "<strong>24/7 Support</strong> - Never get stuck with round-the-clock assistance",
      "<strong>Internship & Job Placement</strong> - Connect with our network of employers",
      "<strong>Professional Certificate</strong> - Boost your resume with our certification",
      "<strong>Join Our Team</strong> - Top performers get opportunities to join Collabogig Innovations"
    ],
    cta: "UPGRADE NOW",
    closing: "Don't miss out on the complete learning experience that will transform your career!"
  },
  {
    subject: "Limited Time Offer: Upgrade Your Code-Fast Course",
    title: "Supercharge Your Coding Journey",
    intro: "How's your coding journey going? We've noticed your dedication to learning, and we believe you have what it takes to excel! Upgrade to our premium course and unlock these career-changing benefits:",
    benefits: [
      "<strong>Project-Based Learning</strong> - Build a professional portfolio with real-world projects",
      "<strong>Career Coaching</strong> - Get guidance on job applications and interview preparation",
      "<strong>Industry Connections</strong> - Network with our partners and alumni",
      "<strong>Advanced Course Materials</strong> - Access specialized modules not available in the free version",
      "<strong>Lifetime Access</strong> - Learn at your own pace with permanent access to course materials"
    ],
    cta: "UPGRADE TODAY",
    closing: "Invest in your future today and see the difference premium education can make!"
  },
  {
    subject: "Your Code-Fast Journey: The Next Chapter",
    title: "Ready for the Complete Experience?",
    intro: "You've taken the first step in your coding journey with our free course. Now it's time to consider where you want your skills to take you. Our premium course offers everything you need to become job-ready:",
    benefits: [
      "<strong>Hands-on Workshops</strong> - Apply your knowledge in guided practical sessions",
      "<strong>Code Reviews</strong> - Get expert feedback on your coding style and techniques",
      "<strong>Community Access</strong> - Join our exclusive community of learners and professionals",
      "<strong>Job Guarantee Program</strong> - Eligible students receive job placement assistance",
      "<strong>Advanced Technologies</strong> - Learn cutting-edge frameworks and tools used in the industry"
    ],
    cta: "LEVEL UP NOW",
    closing: "The difference between where you are and where you want to be is just one upgrade away!"
  },
  {
    subject: "Unlock Premium Code-Fast Features Today",
    title: "Elevate Your Coding Skills",
    intro: "We've been watching your progress in the free course, and we're impressed! Imagine how much more you could achieve with our premium resources and support. Upgrade now to experience:",
    benefits: [
      "<strong>Personalized Learning Path</strong> - Get a customized curriculum based on your goals",
      "<strong>Live Coding Sessions</strong> - Participate in interactive coding challenges with instructors",
      "<strong>Priority Support</strong> - Get your questions answered quickly by our expert team",
      "<strong>Industry-Standard Tools</strong> - Learn to use the same tools professionals use daily",
      "<strong>Capstone Projects</strong> - Graduate with impressive projects to showcase to employers"
    ],
    cta: "UPGRADE & EXCEL",
    closing: "Your coding potential is unlimited - give yourself the tools to reach it!"
  },
  {
    subject: "Special Invitation: Join Our Premium Code-Fast Program",
    title: "From Beginner to Professional",
    intro: "Thank you for being part of our Code-Fast community! We'd like to extend a special invitation to upgrade to our premium program, designed to transform beginners into industry-ready professionals:",
    benefits: [
      "<strong>Mentorship Program</strong> - Get paired with an industry professional for guidance",
      "<strong>Technical Interview Prep</strong> - Practice with mock interviews and feedback sessions",
      "<strong>Exclusive Hackathons</strong> - Participate in coding competitions with prizes",
      "<strong>Resume Building</strong> - Get help crafting a tech resume that stands out",
      "<strong>Networking Events</strong> - Connect with potential employers at our virtual job fairs"
    ],
    cta: "ACCEPT INVITATION",
    closing: "Join the ranks of our successful graduates who are now working in top tech companies!"
  }
];

// Helper function to get a random template
export const getRandomPromoTemplate = () => {
  const randomIndex = Math.floor(Math.random() * upgradePromoTemplates.length);
  return upgradePromoTemplates[randomIndex];
};

// Helper function to get a template by index (for rotation purposes)
export const getPromoTemplateByIndex = (index) => {
  const normalizedIndex = index % upgradePromoTemplates.length;
  return upgradePromoTemplates[normalizedIndex];
};