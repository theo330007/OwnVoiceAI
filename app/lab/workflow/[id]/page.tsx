'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { Phase1ContextualBrief } from '@/components/workflow/Phase1ContextualBrief';
import { Phase2AssetOrchestration } from '@/components/workflow/Phase2AssetOrchestration';
import { WorkflowChatInterface } from '@/components/workflow/WorkflowChatInterface';
import { WorkflowNotes } from '@/components/workflow/WorkflowNotes';
import { getWorkflow, getUserProducts, getUserCaseStudies, updateWorkflowPhase } from '@/app/actions/workflows';
import { getWorkflowCollaborationNotes } from '@/app/actions/collaboration';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([]);
  const [currentPhase2Content, setCurrentPhase2Content] = useState<any>(null);
  const [externalPhase2Update, setExternalPhase2Update] = useState<any>(null);
  const chatSendRef = useRef<((msg: string) => void) | null>(null);

  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);

      const [workflowData, productsData, caseStudiesData, notesData] = await Promise.all([
        getWorkflow(workflowId, currentUser.id),
        getUserProducts(currentUser.id),
        getUserCaseStudies(currentUser.id),
        getWorkflowCollaborationNotes(workflowId),
      ]);

      if (!workflowData) {
        router.push('/dashboard');
        return;
      }

      setWorkflow(workflowData);
      setCurrentPhase(workflowData.current_phase);
      setProducts(productsData);
      setCaseStudies(caseStudiesData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load workflow:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseClick = (phase: number) => {
    if (phase <= currentPhase) {
      setCurrentPhase(phase);
    }
  };

  const handlePhase1Complete = async (data: any) => {
    try {
      await updateWorkflowPhase(workflowId, user.id, 1, data);
      setCurrentPhase(2);
      // Update local workflow state
      setWorkflow({
        ...workflow,
        current_phase: 2,
        phase_data: {
          ...workflow.phase_data,
          phase1: data,
        },
      });
    } catch (error: any) {
      alert(error.message || 'Failed to save phase data');
    }
  };

  const handlePhase2Complete = async (data: any) => {
    try {
      await updateWorkflowPhase(workflowId, user.id, 2, data);
      setCurrentPhase(3);
      // Update local workflow state
      setWorkflow({
        ...workflow,
        current_phase: 3,
        phase_data: {
          ...workflow.phase_data,
          phase2: data,
        },
      });
    } catch (error: any) {
      alert(error.message || 'Failed to save phase data');
    }
  };

  const handleContentUpdate = (updates: any) => {
    setExternalPhase2Update(updates);
  };

  const handleNotesChange = async () => {
    try {
      const notesData = await getWorkflowCollaborationNotes(workflowId);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to reload notes:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-sage animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-sage/70 mb-4">Workflow not found</p>
          <Link
            href="/dashboard"
            className="text-dusty-rose hover:text-dusty-rose/80 font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract content idea for the selected content type
  const contentIdea = workflow.strategic_insights?.content_ideas?.[workflow.content_type];
  const trendTitle = workflow.strategic_insights?.trend_title || workflow.project_name;

  // Build context for chatbot
  const workflowContext = {
    workflowId,
    projectName: workflow.project_name,
    contentType: workflow.content_type,
    trendTitle,
    contentIdea,
    currentPhase,
    phaseData: workflow.phase_data,
    products,
    caseStudies,
    brandStyle: user.brand_style_prompt,
    brandVoice: user.brand_voice_tone,
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-sage/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-sage/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-sage" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl text-sage">{workflow.project_name}</h1>
              <p className="text-sage/60 text-sm capitalize">
                {workflow.content_type.replace('_', ' ')} Content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <WorkflowStepper currentPhase={currentPhase} onPhaseClick={handlePhaseClick} />

      {/* 2-Column Layout: Workflow + Chat */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Workflow Phases (2/3 width) */}
          <div className="lg:col-span-2">
            {currentPhase === 1 && (
              <Phase1ContextualBrief
                contentIdea={contentIdea}
                trendTitle={trendTitle}
                products={products}
                caseStudies={caseStudies}
                onComplete={handlePhase1Complete}
                initialData={workflow.phase_data?.phase1}
              />
            )}

            {currentPhase === 2 && (
              <Phase2AssetOrchestration
                phase1Data={workflow.phase_data?.phase1 || {}}
                contentIdea={contentIdea}
                trendTitle={trendTitle}
                brandStyle={user.brand_style_prompt}
                userProfile={user}
                onComplete={handlePhase2Complete}
                initialData={workflow.phase_data?.phase2}
                chatMessages={chatMessages}
                creatorFaceUrl={user.creator_face_url}
                creatorVoiceUrl={user.creator_voice_url}
                externalUpdate={externalPhase2Update}
                onContentChange={setCurrentPhase2Content}
                onModify={(msg) => chatSendRef.current?.(msg)}
              />
            )}

            {currentPhase === 3 && (
              <div className="max-w-4xl mx-auto text-center py-20">
                <h2 className="font-serif text-4xl text-sage mb-4">
                  Phase 3: OwnVoice Guardrail
                </h2>
                <p className="text-sage/70 mb-8">
                  Science verification and tone alignment - Coming Soon
                </p>
              </div>
            )}

            {currentPhase === 4 && (
              <div className="max-w-4xl mx-auto text-center py-20">
                <h2 className="font-serif text-4xl text-sage mb-4">
                  Phase 4: Scheduling & Hand-off
                </h2>
                <p className="text-sage/70 mb-8">
                  Export and schedule content - Coming Soon
                </p>
              </div>
            )}
          </div>

          {/* Right Side: AI Assistant + Notes (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            <WorkflowChatInterface
              context={workflowContext}
              messages={chatMessages}
              onMessagesChange={setChatMessages}
              onContentUpdate={handleContentUpdate}
              currentContent={currentPhase2Content}
              onExternalMessage={(send) => { chatSendRef.current = send; }}
            />
            <WorkflowNotes
              workflowId={workflowId}
              notes={notes}
              currentUserId={user.id}
              onNotesChange={handleNotesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
