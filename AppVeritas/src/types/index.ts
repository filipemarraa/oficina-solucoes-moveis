export type Category = 
  | 'Saúde'
  | 'Educação'
  | 'Segurança'
  | 'Trabalho'
  | 'Meio Ambiente'
  | 'Economia'
  | 'Direitos Humanos'
  | 'Tecnologia'
  | 'Outros';

export type ProjectStatus = 
  | 'Em tramitação'
  | 'Aprovado'
  | 'Arquivado'
  | 'Vetado'
  | 'Em análise'
  | 'Em votação'
  | 'Retirado';

export interface Project {
  id: string;
  title: string;
  number: string;
  summary: string;
  category: Category;
  status: ProjectStatus;
  date: string;
  authorId: string;
  authorName: string;
  currentStage: string;
  progress: number;
  isFavorite?: boolean;
  documentUrl?: string;
  detailedDescription?: string;
  source?: string;
  sourceId?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  interests: Category[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'update' | 'success';
  date: string;
  isRead: boolean;
  projectId?: string;
}

export type NotificationType = 'trending' | 'interest_update' | 'status_change' | 'keyword_match';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  projectId?: string;
  projectTitle?: string;
  date: string;
  isRead: boolean;
  icon?: string;
}

export interface UserInteraction {
  projectId: string;
  type: 'support' | 'against' | 'alert';
  date: string;
}

export interface TrendingProject extends Project {
  interactionsCount: number;
  interactionsToday: number;
}

export interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  illustration: string;
  // Optional image source for the slide (require(...) result). If present, the onboarding
  // screen will render this image instead of the emoji/text `illustration`.
  illustrationImage?: any;
}

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Interests: undefined;
  MainTabs: undefined;
  ProjectDetails: { project: Project };
  Notifications: undefined;
};

export type MainTabParamList = {
  Projects: undefined;
  Favorites: undefined;
  Trending: undefined;
  Profile: undefined;
};
