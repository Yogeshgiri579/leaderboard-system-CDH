/**
 * Official 10-Module Badge Catalog for CloudDevOpsHub
 * Based on Batch 45 - Multi-Cloud & DevOps With AI (55 Live Sessions Comprehensive Curriculum)
 */
const BATCH_45_MODULES = [
  {
    id: 'MOD_01',
    moduleNumber: 1,
    code: 'MODULE 01',
    title: 'FOUNDATIONS',
    subtitle: '& AI',
    fullTitle: 'Cloud + DevOps + AI Foundations',
    color: '#00838f', // Teal
    gradient: 'linear-gradient(135deg, #0097a7 0%, #006064 100%)',
    description: 'Cloud Computing Overview, GCP Practical, DevOps Core Principles, AI Foundations & 55-Day Roadmap.',
    keywords: [
      'foundations', 'cloud overview', 'gcp practical', 'devops concepts', 
      'devops principles', 'ai foundation', 'ai foundations', 'roadmap', 
      '55-day', 'lms', 'batch 45', 'batch44', 'batch 44'
    ],
  },
  {
    id: 'MOD_02',
    moduleNumber: 2,
    code: 'MODULE 02',
    title: 'LINUX',
    subtitle: 'UBUNTU + GCP',
    fullTitle: 'Linux Administration + GCP',
    color: '#d84315', // Deep Orange-Red
    gradient: 'linear-gradient(135deg, #f4511e 0%, #bf360c 100%)',
    description: 'Linux OS Architecture, Ubuntu, File Permissions, Systemd Services, Shell Navigation, and GCP Compute Engine.',
    keywords: [
      'linux', 'ubuntu', 'shell', 'bash', 'systemd', 'permissions', 
      'gcp compute', 'gcp', 'google cloud', 'ssh', 'cron', 'package manager', 'apt'
    ],
  },
  {
    id: 'MOD_03',
    moduleNumber: 3,
    code: 'MODULE 03',
    title: 'AWS',
    subtitle: 'SERVICES',
    fullTitle: 'AWS Cloud Services',
    color: '#ef6c00', // AWS Orange
    gradient: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)',
    description: 'Mastery over AWS Core Infrastructure: EC2, S3, IAM Least Privilege, VPC Peering, CloudWatch, Route53, and RDS.',
    keywords: [
      'aws', 'ec2', 's3', 'iam', 'vpc', 'cloudwatch', 'route53', 
      'rds', 'elb', 'load balancer', 'autoscaling', 'auto scaling', 'cloud architecture'
    ],
  },
  {
    id: 'MOD_04',
    moduleNumber: 4,
    code: 'MODULE 04',
    title: 'CI/CD',
    subtitle: 'GIT & JENKINS',
    fullTitle: 'CI/CD & Git Version Control',
    color: '#c2185b', // Crimson / Magenta
    gradient: 'linear-gradient(135deg, #e91e63 0%, #880e4f 100%)',
    description: 'Distributed Version Control with Git/GitHub, Jenkins Continuous Integration, GitHub Actions Pipelines & Webhooks.',
    keywords: [
      'git', 'github', 'jenkins', 'ci/cd', 'cicd', 'pipeline', 
      'github actions', 'webhooks', 'continuous integration', 'continuous delivery', 'branching'
    ],
  },
  {
    id: 'MOD_05',
    moduleNumber: 5,
    code: 'MODULE 05',
    title: 'DOCKER',
    subtitle: '& KUBERNETES',
    fullTitle: 'Docker & Kubernetes Containers',
    color: '#0288d1', // Docker Blue
    gradient: 'linear-gradient(135deg, #03a9f4 0%, #01579b 100%)',
    description: 'Containerization with Dockerfile and Compose; Container Orchestration with Kubernetes Pods, Ingress, and Helm.',
    keywords: [
      'docker', 'container', 'containers', 'dockerfile', 'docker compose', 
      'kubernetes', 'k8s', 'helm', 'pod', 'pods', 'ingress', 'deployment', 'kubectl'
    ],
  },
  {
    id: 'MOD_06',
    moduleNumber: 6,
    code: 'MODULE 06',
    title: 'TF',
    subtitle: '& ANSIBLE',
    fullTitle: 'Ansible & Terraform IaC',
    color: '#512da8', // Deep Violet / Purple
    gradient: 'linear-gradient(135deg, #7e57c2 0%, #4527a0 100%)',
    description: 'Infrastructure as Code with HashiCorp Terraform state management and Configuration Management with Ansible Playbooks.',
    keywords: [
      'terraform', 'tf', 'iac', 'infrastructure as code', 'ansible', 
      'playbook', 'playbooks', 'automation', 'hcl', 'inventory', 'state file'
    ],
  },
  {
    id: 'MOD_07',
    moduleNumber: 7,
    code: 'MODULE 07',
    title: 'PYTHON',
    subtitle: '& AUTOMATION',
    fullTitle: 'Python & Shell Scripting Automation',
    color: '#2e7d32', // Emerald Green
    gradient: 'linear-gradient(135deg, #4caf50 0%, #1b5e20 100%)',
    description: 'Bash automation scripts, Python scripting for DevOps, Boto3 AWS SDK integrations, and automated operational tasks.',
    keywords: [
      'python', 'shell scripting', 'scripting', 'bash scripting', 
      'boto3', 'automation script', 'cronjob', 'cli script', 'regex'
    ],
  },
  {
    id: 'MOD_08',
    moduleNumber: 8,
    code: 'MODULE 08',
    title: 'AZURE',
    subtitle: 'AIOPS + GENAI',
    fullTitle: 'Azure & AIOps + GenAI',
    color: '#0277bd', // Azure Blue
    gradient: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    description: 'Microsoft Azure enterprise cloud services, Azure DevOps pipelines, AIOps monitoring, and GenAI LLM automation in DevOps.',
    keywords: [
      'azure', 'microsoft azure', 'azure devops', 'aiops', 
      'genai', 'gen ai', 'copilot', 'llm', 'generative ai', 'openai', 'gemini'
    ],
  },
  {
    id: 'MOD_09',
    moduleNumber: 9,
    code: 'MODULE 09',
    title: 'CAPSTONE',
    subtitle: '9 REAL PROJECTS',
    fullTitle: '9 Real-World Industry Projects',
    color: '#283593', // Deep Indigo
    gradient: 'linear-gradient(135deg, #3949ab 0%, #1a237e 100%)',
    description: 'Hands-on execution of production-grade architectural capstones, GitOps with ArgoCD, and end-to-end multi-cloud delivery.',
    keywords: [
      'real project', 'capstone', 'production deployment', 'projects', 
      'argocd', 'gitops', 'end-to-end', 'case study', 'architecture implementation'
    ],
  },
  {
    id: 'MOD_10',
    moduleNumber: 10,
    code: 'MODULE 10',
    title: 'CAREER',
    subtitle: '& REFERRALS',
    fullTitle: 'Daily Career & Placement Referrals',
    color: '#f57f17', // Gold / Amber
    gradient: 'linear-gradient(135deg, #ffb300 0%, #e65100 100%)',
    description: 'Resume optimization, high-impact portfolio, LinkedIn personal branding, mock interviews, and 40 LPA Lakshya placement referrals.',
    keywords: [
      'career', 'resume', 'mock interview', 'interview', 'referrals', 
      'linkedin optimization', 'lakshya', 'placement', 'portfolio', 'job referral'
    ],
  },
];

module.exports = {
  BATCH_45_MODULES,
};
