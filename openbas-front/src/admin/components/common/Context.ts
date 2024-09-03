import { createContext } from 'react';
import type { ArticleStore, FullArticleStore } from '../../../actions/channels/Article';
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
  Evaluation,
  EvaluationInput,
  ImportTestSummary,
  Inject,
  InjectsImportInput,
  LessonsAnswer,
  LessonsAnswerCreateInput,
  LessonsCategory,
  LessonsCategoryCreateInput,
  LessonsCategoryTeamsInput,
  LessonsCategoryUpdateInput,
  LessonsQuestion,
  LessonsQuestionCreateInput,
  LessonsQuestionUpdateInput,
  LessonsSendInput,
  Objective,
  ObjectiveInput,
  SearchPaginationInput,
  Team,
  TeamCreateInput,
  Variable,
  VariableInput,
} from '../../../utils/api-types';
import type { UserStore } from '../teams/players/Player';
import type { InjectOutputType, InjectStore } from '../../../actions/injects/Inject';
import { Page } from '../../../components/common/queryable/Page';

export type PermissionsContextType = {
  permissions: { readOnly: boolean, canWrite: boolean, isRunning: boolean }
};

export type ArticleContextType = {
  previewArticleUrl: (article: FullArticleStore) => string;
  onAddArticle: (data: ArticleCreateInput) => Promise<{ result: string }>;
  onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => string;
  onDeleteArticle: (article: ArticleStore) => string;
};

export type ChallengeContextType = {
  previewChallengeUrl: () => string
};

export type DocumentContextType = {
  onInitDocument: () => {
    document_tags: { id: string, label: string }[],
    document_exercises: { id: string, label: string }[],
    document_scenarios: { id: string, label: string }[]
  }
};

export type VariableContextType = {
  onCreateVariable: (data: VariableInput) => void,
  onEditVariable: (variable: Variable, data: VariableInput) => void,
  onDeleteVariable: (variable: Variable) => void,
};

export type TeamContextType = {
  onAddUsersTeam: (teamId: Team['team_id'], userIds: UserStore['user_id'][]) => Promise<void>,
  onRemoveUsersTeam: (teamId: Team['team_id'], userIds: UserStore['user_id'][]) => Promise<void>,
  onAddTeam?: (teamId: Team['team_id']) => Promise<void>,
  onCreateTeam?: (team: TeamCreateInput) => Promise<{ result: string }>,
  onRemoveTeam?: (teamId: Team['team_id']) => void,
  onToggleUser?: (teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean) => void,
  checkUserEnabled?: (teamId: Team['team_id'], userId: UserStore['user_id']) => boolean,
  computeTeamUsersEnabled?: (teamId: Team['team_id']) => number,
};

export type InjectContextType = {
  searchInjects: (input: SearchPaginationInput) => Promise<{ data: Page<InjectOutputType> }>,
  onAddInject: (inject: Inject) => Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }>,
  onUpdateInject: (injectId: Inject['inject_id'], inject: Inject) => Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }>,
  onUpdateInjectTrigger?: (injectId: Inject['inject_id']) => void,
  onUpdateInjectActivation: (injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }) => Promise<{
    result: string,
    entities: { injects: Record<string, InjectStore> }
  }>,
  onInjectDone?: (injectId: Inject['inject_id']) => void,
  onDeleteInject: (injectId: Inject['inject_id']) => void,
  onImportInjectFromXls?: (importId: string, input: InjectsImportInput) => Promise<ImportTestSummary>
  onDryImportInjectFromXls?: (importId: string, input: InjectsImportInput) => Promise<ImportTestSummary>
};
export type LessonContextType = {
  onApplyLessonsTemplate: (data: string) => Promise<LessonsCategory[]>,
  onResetLessonsAnswers?: () => Promise<LessonsCategory[]>,
  onEmptyLessonsCategories: () => Promise<LessonsCategory[]>,
  onUpdateSourceLessons: (data: boolean) => Promise<{ result: string }>,
  onSendLessons?: (data: LessonsSendInput) => void,
  onAddLessonsCategory: (data: LessonsCategoryCreateInput) => Promise<LessonsCategory>,
  onDeleteLessonsCategory: (data: string) => void,
  onUpdateLessonsCategory: (lessonCategoryId: string, data: LessonsCategoryUpdateInput) => Promise<LessonsCategory>,
  onUpdateLessonsCategoryTeams: (lessonCategoryId: string, data: LessonsCategoryTeamsInput) => Promise<LessonsCategory>,
  onDeleteLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string) => void,
  onUpdateLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string, data: LessonsQuestionUpdateInput) => Promise<LessonsQuestion>,
  onAddLessonsQuestion: (lessonsCategoryId: string, data: LessonsQuestionCreateInput) => Promise<LessonsQuestion>,
  onAddObjective: (data: ObjectiveInput) => Promise<Objective>,
  onUpdateObjective: (objectiveId: string, data: ObjectiveInput) => Promise<Objective>,
  onDeleteObjective: (objectiveId: string) => void,
  onAddEvaluation: (objectiveId: string, data: EvaluationInput) => Promise<Evaluation>,
  onUpdateEvaluation: (objectiveId: string, evaluationId: string, data: EvaluationInput) => Promise<Evaluation>,
  onFetchEvaluation: (objectiveId: string) => Promise<Evaluation[]>,
};
export type ViewLessonContextType = {
  onAddLessonsAnswers?: (questionCategory: string, lessonsQuestionId: string, answerData: LessonsAnswerCreateInput) => Promise<LessonsAnswer>,
  onFetchPlayerLessonsAnswers?: () => Promise<LessonsAnswer[]>,
};

export const PermissionsContext = createContext<PermissionsContextType>({
  permissions: { canWrite: false, readOnly: false, isRunning: false },
});
export const ArticleContext = createContext<ArticleContextType>({
  onAddArticle(_data: ArticleCreateInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onDeleteArticle(_article: ArticleStore): string {
    return '';
  },
  onUpdateArticle(_article: ArticleStore, _data: ArticleUpdateInput): string {
    return '';
  },
  previewArticleUrl(_article: FullArticleStore): string {
    return '';
  },
});
export const ChallengeContext = createContext<ChallengeContextType>({
  previewChallengeUrl(): string {
    return '';
  },
});
export const DocumentContext = createContext<DocumentContextType>({
  onInitDocument(): {
    document_tags: { id: string; label: string }[];
    document_exercises: { id: string; label: string }[];
    document_scenarios: { id: string; label: string }[]
  } {
    return { document_exercises: [], document_scenarios: [], document_tags: [] };
  },
});
export const VariableContext = createContext<VariableContextType>({
  onCreateVariable(_data: VariableInput): void {
  },
  onDeleteVariable(_variable: Variable): void {
  },
  onEditVariable(_variable: Variable, _data: VariableInput): void {
  },
});
export const TeamContext = createContext<TeamContextType>({
  onAddUsersTeam(_teamId: Team['team_id'], _userIds: UserStore['user_id'][]): Promise<void> {
    return new Promise<void>(() => {
    });
  },
  onRemoveUsersTeam(_teamId: Team['team_id'], _userIds: UserStore['user_id'][]): Promise<void> {
    return new Promise<void>(() => {
    });
  },
});
export const InjectContext = createContext<InjectContextType>({
  searchInjects(_: SearchPaginationInput): Promise<{ data: Page<InjectOutputType> }> {
    return new Promise<{ data: Page<InjectOutputType> }>(() => {
    });
  },
  onAddInject(_inject: Inject): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
    return Promise.resolve({ result: '', entities: { injects: {} } });
  },
  onUpdateInject(_injectId: Inject['inject_id'], _inject: Inject): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
    return Promise.resolve({ result: '', entities: { injects: {} } });
  },
  onUpdateInjectTrigger(_injectId: Inject['inject_id']): void {
  },
  onUpdateInjectActivation(_injectId: Inject['inject_id'], _injectEnabled: { inject_enabled: boolean }): Promise<{
    result: string,
    entities: { injects: Record<string, InjectStore> }
  }> {
    return Promise.resolve({ result: '', entities: { injects: {} } });
  },
  onInjectDone(_injectId: Inject['inject_id']): void {
  },
  onDeleteInject(_injectId: Inject['inject_id']): void {
  },
  onImportInjectFromXls(_importId: string, _input: InjectsImportInput): Promise<ImportTestSummary> {
    return new Promise<ImportTestSummary>(() => {
    });
  },
  onDryImportInjectFromXls(_importId: string, _input: InjectsImportInput): Promise<ImportTestSummary> {
    return new Promise<ImportTestSummary>(() => {
    });
  },
});
export const LessonContext = createContext<LessonContextType>({
  onApplyLessonsTemplate(_data: string): Promise<LessonsCategory[]> {
    return new Promise<LessonsCategory[]>(() => {
    });
  },
  onResetLessonsAnswers(): Promise<LessonsCategory[]> {
    return new Promise<LessonsCategory[]>(() => {
    });
  },
  onEmptyLessonsCategories(): Promise<LessonsCategory[]> {
    return new Promise<LessonsCategory[]>(() => {
    });
  },
  onUpdateSourceLessons(_data: boolean): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onSendLessons(_data: LessonsSendInput): void {
  },
  onAddLessonsCategory(_data: LessonsCategoryCreateInput): Promise<LessonsCategory> {
    return new Promise<LessonsCategory>(() => {
    });
  },
  onDeleteLessonsCategory(_data: string): void {
  },
  onUpdateLessonsCategory(_lessonCategoryId: string, _data: LessonsCategoryUpdateInput): Promise<LessonsCategory> {
    return new Promise<LessonsCategory>(() => {
    });
  },
  onUpdateLessonsCategoryTeams(_lessonCategoryId: string, _data: LessonsCategoryTeamsInput): Promise<LessonsCategory> {
    return new Promise<LessonsCategory>(() => {
    });
  },
  onDeleteLessonsQuestion(_lessonsCategoryId: string, _lessonsQuestionId: string): void {
  },
  onUpdateLessonsQuestion(_lessonsCategoryId: string, _lessonsQuestionId: string, _data: LessonsQuestionUpdateInput): Promise<LessonsQuestion> {
    return new Promise<LessonsQuestion>(() => {
    });
  },
  onAddLessonsQuestion(_lessonsCategoryId: string, _data: LessonsQuestionCreateInput): Promise<LessonsQuestion> {
    return new Promise<LessonsQuestion>(() => {
    });
  },
  onAddObjective(_data: ObjectiveInput): Promise<Objective> {
    return new Promise<Objective>(() => {
    });
  },
  onUpdateObjective(_objectiveId: string, _data: ObjectiveInput): Promise<Objective> {
    return new Promise<Objective>(() => {
    });
  },
  onDeleteObjective(_objectiveId: string): void {
  },
  onAddEvaluation(_objectiveId: string, _data: EvaluationInput): Promise<Evaluation> {
    return new Promise<Evaluation>(() => {
    });
  },
  onUpdateEvaluation(_objectiveId: string, _evaluationId: string, _data: EvaluationInput): Promise<Evaluation> {
    return new Promise<Evaluation>(() => {
    });
  },
  onFetchEvaluation(_objectiveId: string): Promise<Evaluation[]> {
    return new Promise<Evaluation[]>(() => {
    });
  },
});
export const ViewLessonContext = createContext<ViewLessonContextType>({
  onAddLessonsAnswers(_questionCategory: string, _lessonsQuestionId: string, _answerData: LessonsAnswerCreateInput): Promise<LessonsAnswer> {
    return new Promise<LessonsAnswer>(() => {
    });
  },
  onFetchPlayerLessonsAnswers(): Promise<LessonsAnswer[]> {
    return new Promise<LessonsAnswer[]>(() => {
    });
  },
});
