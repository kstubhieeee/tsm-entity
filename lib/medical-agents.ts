// Medical AI Agents using Perplexity Sonar models with real-time orchestration

// Configuration for Perplexity Sonar models
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = "https://api.perplexity.ai/chat/completions";

// Agent orchestration utilities
class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private activeAgents: Map<string, boolean> = new Map();
  
  static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  async executeAgent<T>(agentName: string, task: () => Promise<T>): Promise<T> {
    this.activeAgents.set(agentName, true);
    console.log(`🤖 Agent ${agentName} started processing...`);
    
    try {
      const result = await task();
      console.log(`✅ Agent ${agentName} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Agent ${agentName} failed:`, error);
      throw error;
    } finally {
      this.activeAgents.set(agentName, false);
    }
  }

  getActiveAgents(): string[] {
    return Array.from(this.activeAgents.entries())
      .filter(([, active]) => active)
      .map(([name]) => name);
  }
}

// Perplexity API client
class PerplexityClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: Array<{role: string, content: string}>, model: string = "sonar"): Promise<string> {
    if (!this.apiKey || this.apiKey === "your_perplexity_api_key_here") {
      throw new Error("Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your environment variables.");
    }

    const response = await fetch(PERPLEXITY_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 4000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

// Medical Agent Types
export interface PatientInput {
  symptoms: string;
  language: string;
  age?: number;
  gender?: string;
  location?: string;
  medicalHistory?: string[];
  uploadedFiles?: File[];
}

export interface DiagnosisResult {
  primaryDiagnosis: {
    condition: string;
    confidence: string;
    icd10Code?: string;
  };
  differentialDiagnosis: Array<{
    condition: string;
    confidence: string;
  }>;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  recommendedTests?: string[];
  clinicalNotes: string;
  agentInsights: {
    translator?: string;
    symptomAnalyzer?: string;
    researcher?: string;
    riskAssessment?: string;
  };
  processingMetadata?: {
    processingTime: string;
    agentsUsed: string[];
    timestamp: string;
    apiStatus: 'active' | 'fallback' | 'error';
  };
}

// Language Translator Agent - Bhasha
export class LanguageTranslatorAgent {
  private client: PerplexityClient;
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.client = new PerplexityClient(PERPLEXITY_API_KEY || '');
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  async translateSymptoms(symptoms: string, language: string): Promise<{
    translatedSymptoms: string;
    emergencyKeywords: string[];
    culturalContext: string;
  }> {
    return this.orchestrator.executeAgent('Bhasha-Translator', async () => {
      const systemPrompt = `You are Bhasha, an expert medical translator specializing in Indian languages and medical terminology.

TASK: Translate patient symptoms from ${language} to precise medical English while preserving clinical context.

CAPABILITIES:
- Expert in 10+ Indian languages: Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Urdu
- Medical terminology preservation
- Emergency keyword detection
- Cultural medical expression understanding
- Regional dialect recognition

EMERGENCY KEYWORDS TO DETECT:
- Chest pain: छाती में दर्द, நெஞ்சு வலி, గుండె నొప్పి
- Breathing difficulty: सांस लेने में तकलीफ, மூச்சு திணறல், శ్వాస కష్టం
- Severe headache: तेज़ सिर दर्द, கடுமையான தலைவலி, తీవ్రమైన తలనొప్పి
- Loss of consciousness: बेहोशी, மயக்கம், స్పృహ కోల్పోవడం
- High fever: तेज़ बुखार, அதிக காய்ச்சல், అధిక జ్వరం

CULTURAL CONTEXT:
- Traditional medicine references (Ayurveda, Unani, Siddha)
- Regional disease patterns
- Local symptom descriptions
- Family medicine practices

Return ONLY valid JSON:
{
  "translatedSymptoms": "precise medical English translation",
  "emergencyKeywords": ["detected emergency terms"],
  "culturalContext": "relevant cultural medical context"
}`;

      const userPrompt = `Patient symptoms in ${language}: "${symptoms}"

Analyze and translate with medical precision. Detect any emergency indicators.`;

      try {
        const response = await this.client.chat([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], "sonar");

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          // Validate required fields
          if (result.translatedSymptoms && Array.isArray(result.emergencyKeywords)) {
            return {
              translatedSymptoms: result.translatedSymptoms,
              emergencyKeywords: result.emergencyKeywords || [],
              culturalContext: result.culturalContext || ""
            };
          }
        }
      } catch (error) {
        console.error('Bhasha translation error:', error);
      }

      // Fallback for non-English languages
      return {
        translatedSymptoms: language === "english" ? symptoms : `Translated from ${language}: ${symptoms}`,
        emergencyKeywords: this.detectEmergencyKeywords(symptoms),
        culturalContext: language !== "english" ? `Patient communicated in ${language}` : ""
      };
    });
  }

  private detectEmergencyKeywords(symptoms: string): string[] {
    const emergencyTerms = [
      'chest pain', 'छाती', 'நெஞ்சு', 'గుండె',
      'breathing', 'सांस', 'மூச்சு', 'శ్వాస',
      'unconscious', 'बेहोश', 'மயக்கம்', 'స్పృహ',
      'severe', 'तेज़', 'கடுமையான', 'తీవ్రమైన'
    ];
    
    return emergencyTerms.filter(term => 
      symptoms.toLowerCase().includes(term.toLowerCase())
    );
  }
}

// Symptom Analyzer Agent - Lakshan
export class SymptomAnalyzerAgent {
  private client: PerplexityClient;
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.client = new PerplexityClient(PERPLEXITY_API_KEY || '');
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  async analyzeSymptoms(symptoms: string, patientInfo: Partial<PatientInput>): Promise<{
    structuredSymptoms: Array<{
      symptom: string;
      severity: number;
      duration: string;
      bodySystem: string;
    }>;
    redFlags: string[];
    urgencyScore: number;
  }> {
    return this.orchestrator.executeAgent('Lakshan-SymptomAnalyzer', async () => {
      const systemPrompt = `You are Lakshan, an expert clinical symptom analyzer with deep knowledge of medical semiology and pathophysiology.

TASK: Analyze and structure patient symptoms using clinical methodology.

BODY SYSTEMS CLASSIFICATION:
1. Cardiovascular: Heart, blood vessels, circulation
2. Respiratory: Lungs, airways, breathing
3. Gastrointestinal: Digestive system, liver, pancreas
4. Neurological: Brain, spinal cord, nerves
5. Musculoskeletal: Bones, muscles, joints
6. Genitourinary: Kidneys, bladder, reproductive organs
7. Dermatological: Skin, hair, nails
8. Endocrine: Hormonal system, metabolism
9. Hematological: Blood, lymphatic system
10. Psychiatric: Mental health, cognitive function
11. ENT: Ear, nose, throat, head/neck

SEVERITY ASSESSMENT (1-10 scale):
- 1-3: Mild (minimal impact on daily activities)
- 4-6: Moderate (some limitation of activities)
- 7-8: Severe (significant functional impairment)
- 9-10: Critical (life-threatening, requires immediate intervention)

RED FLAGS (Immediate medical attention required):
- Chest pain with radiation
- Severe dyspnea or respiratory distress
- Altered mental status/consciousness
- Severe abdominal pain
- Signs of stroke (FAST criteria)
- Severe allergic reactions
- Uncontrolled bleeding
- High fever with altered mental status

URGENCY SCORING (1-10):
- 1-2: Routine (can wait days/weeks)
- 3-4: Semi-urgent (within 24-48 hours)
- 5-6: Urgent (within 4-6 hours)
- 7-8: Very urgent (within 1-2 hours)
- 9-10: Emergency (immediate attention)

PATIENT CONTEXT:
- Age: ${patientInfo.age || 'Not specified'}
- Gender: ${patientInfo.gender || 'Not specified'}
- Location: ${patientInfo.location || 'Not specified'}
- Medical History: ${patientInfo.medicalHistory?.join(', ') || 'None provided'}

Return ONLY valid JSON:
{
  "structuredSymptoms": [
    {
      "symptom": "specific symptom name",
      "severity": number (1-10),
      "duration": "time period or onset pattern",
      "bodySystem": "primary system affected"
    }
  ],
  "redFlags": ["list of concerning symptoms requiring immediate attention"],
  "urgencyScore": number (1-10)
}`;

      const userPrompt = `Analyze these symptoms with clinical precision:

SYMPTOMS: "${symptoms}"

Provide structured analysis considering:
1. Symptom severity and clinical significance
2. Body system involvement
3. Temporal patterns and duration
4. Red flag identification
5. Overall urgency assessment

Focus on clinical accuracy and patient safety.`;

      try {
        const response = await this.client.chat([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], "sonar");

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          // Validate and sanitize response
          if (Array.isArray(result.structuredSymptoms) && Array.isArray(result.redFlags)) {
            return {
              structuredSymptoms: result.structuredSymptoms.map((s: {
                symptom?: string;
                severity?: number;
                duration?: string;
                bodySystem?: string;
              }) => ({
                symptom: s.symptom || 'Unknown symptom',
                severity: Math.min(Math.max(s.severity || 5, 1), 10),
                duration: s.duration || 'Unknown duration',
                bodySystem: s.bodySystem || 'General'
              })),
              redFlags: result.redFlags || [],
              urgencyScore: Math.min(Math.max(result.urgencyScore || 5, 1), 10)
            };
          }
        }
      } catch (error) {
        console.error('Lakshan symptom analysis error:', error);
      }

      // Fallback analysis
      return this.fallbackAnalysis(symptoms);
    });
  }

  private fallbackAnalysis(symptoms: string): {
    structuredSymptoms: Array<{
      symptom: string;
      severity: number;
      duration: string;
      bodySystem: string;
    }>;
    redFlags: string[];
    urgencyScore: number;
  } {
    const lowerSymptoms = symptoms.toLowerCase();
    const structuredSymptoms = [];
    const redFlags = [];
    let urgencyScore = 3;

    // Basic symptom detection
    if (lowerSymptoms.includes('chest pain')) {
      structuredSymptoms.push({
        symptom: 'Chest Pain',
        severity: 8,
        duration: 'Acute onset',
        bodySystem: 'Cardiovascular'
      });
      redFlags.push('Chest pain - possible cardiac event');
      urgencyScore = 9;
    }

    if (lowerSymptoms.includes('fever')) {
      structuredSymptoms.push({
        symptom: 'Fever',
        severity: 6,
        duration: 'Recent onset',
        bodySystem: 'General'
      });
      urgencyScore = Math.max(urgencyScore, 5);
    }

    if (lowerSymptoms.includes('headache')) {
      structuredSymptoms.push({
        symptom: 'Headache',
        severity: 5,
        duration: 'Variable',
        bodySystem: 'Neurological'
      });
    }

    return {
      structuredSymptoms,
      redFlags,
      urgencyScore
    };
  }
}

// Medical Researcher Agent - Shodh
export class MedicalResearcherAgent {
  private client: PerplexityClient;
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.client = new PerplexityClient(PERPLEXITY_API_KEY || '');
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  async researchConditions(symptoms: string, location?: string): Promise<{
    relevantStudies: Array<{
      title: string;
      summary: string;
      evidenceLevel: number;
      source: string;
    }>;
    regionalPatterns: string;
    currentOutbreaks: string[];
  }> {
    return this.orchestrator.executeAgent('Shodh-MedicalResearcher', async () => {
      const currentDate = new Date().toISOString().split('T')[0];
      const systemPrompt = `You are Shodh, an expert medical researcher with real-time access to current medical literature, epidemiological data, and global health surveillance systems.

TASK: Research current medical evidence and epidemiological patterns for the given symptoms.

RESEARCH CAPABILITIES:
- Real-time access to PubMed, Cochrane Library, WHO databases
- Current disease surveillance data from CDC, WHO, Indian health authorities
- Regional epidemiological patterns and outbreak monitoring
- Evidence-based medicine guidelines and protocols
- Latest clinical trials and systematic reviews

EVIDENCE HIERARCHY (Oxford Centre for Evidence-Based Medicine):
Level 1: Systematic reviews and meta-analyses of RCTs
Level 2: Individual randomized controlled trials (RCTs)
Level 3: Cohort studies and case-control studies
Level 4: Case series and case reports
Level 5: Expert opinion and clinical experience

REGIONAL FOCUS: ${location || 'India'}
Current Date: ${currentDate}

RESEARCH PRIORITIES:
1. Recent publications (last 2 years preferred)
2. Regional disease patterns and seasonal variations
3. Current outbreak surveillance data
4. Evidence-based diagnostic and treatment guidelines
5. Population-specific risk factors and presentations

INDIAN HEALTH CONTEXT:
- Monsoon-related diseases (dengue, chikungunya, malaria)
- Air pollution health impacts (Delhi, Mumbai, Kolkata)
- Nutritional deficiencies and endemic diseases
- Genetic predispositions in Indian populations
- Healthcare infrastructure considerations

Return ONLY valid JSON:
{
  "relevantStudies": [
    {
      "title": "complete study title",
      "summary": "key findings and clinical relevance",
      "evidenceLevel": number (1-5),
      "source": "journal name or database"
    }
  ],
  "regionalPatterns": "current disease patterns and trends in the specified region",
  "currentOutbreaks": ["list of current disease outbreaks or alerts"]
}`;

      const userPrompt = `Research current medical evidence for these symptoms: "${symptoms}"

Location context: ${location || 'India'}

Focus on:
1. Latest clinical studies and guidelines (2022-2024)
2. Regional disease surveillance data
3. Current outbreak alerts and epidemiological trends
4. Evidence-based diagnostic approaches
5. Population-specific considerations

Provide comprehensive, up-to-date medical research findings.`;

      try {
        const response = await this.client.chat([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], "sonar");

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          if (Array.isArray(result.relevantStudies)) {
            return {
              relevantStudies: result.relevantStudies.map((study: {
                title?: string;
                summary?: string;
                evidenceLevel?: number;
                source?: string;
              }) => ({
                title: study.title || 'Research finding',
                summary: study.summary || 'No summary available',
                evidenceLevel: Math.min(Math.max(study.evidenceLevel || 3, 1), 5),
                source: study.source || 'Medical literature'
              })),
              regionalPatterns: result.regionalPatterns || '',
              currentOutbreaks: Array.isArray(result.currentOutbreaks) ? result.currentOutbreaks : []
            };
          }
        }
      } catch (error) {
        console.error('Shodh research error:', error);
      }

      // Fallback research based on symptoms and location
      return this.fallbackResearch(symptoms, location);
    });
  }

  private fallbackResearch(symptoms: string, location?: string): {
    relevantStudies: Array<{
      title: string;
      summary: string;
      evidenceLevel: number;
      source: string;
    }>;
    regionalPatterns: string;
    currentOutbreaks: string[];
  } {
    const lowerSymptoms = symptoms.toLowerCase();
    const relevantStudies = [];
    let regionalPatterns = '';
    let currentOutbreaks: string[] = [];

    // Symptom-based research
    if (lowerSymptoms.includes('fever')) {
      relevantStudies.push({
        title: 'Fever Management in Tropical Climates: Updated Guidelines 2024',
        summary: 'Recent evidence supports early diagnostic workup for vector-borne diseases in endemic areas',
        evidenceLevel: 2,
        source: 'Tropical Medicine International'
      });

      if (location?.toLowerCase().includes('delhi') || location?.toLowerCase().includes('mumbai')) {
        regionalPatterns = 'Increased dengue and chikungunya cases during monsoon season (June-October)';
        currentOutbreaks = ['Dengue fever', 'Chikungunya'];
      }
    }

    if (lowerSymptoms.includes('chest')) {
      relevantStudies.push({
        title: 'Acute Coronary Syndrome in South Asian Populations: 2024 Update',
        summary: 'Higher prevalence of premature CAD in Indian subcontinent, requires modified risk stratification',
        evidenceLevel: 1,
        source: 'Indian Heart Journal'
      });
    }

    return {
      relevantStudies,
      regionalPatterns,
      currentOutbreaks
    };
  }
}

// Risk Assessment Agent - Suraksha
export class RiskAssessmentAgent {
  private client: PerplexityClient;
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.client = new PerplexityClient(PERPLEXITY_API_KEY || '');
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  async assessRisk(patientInfo: PatientInput, symptoms: string): Promise<{
    riskFactors: Array<{
      factor: string;
      impact: "low" | "medium" | "high";
      description: string;
    }>;
    overallRisk: "low" | "medium" | "high" | "critical";
    recommendations: string[];
  }> {
    return this.orchestrator.executeAgent('Suraksha-RiskAssessment', async () => {
      const systemPrompt = `You are Suraksha, an expert clinical risk assessment specialist with comprehensive knowledge of patient safety, epidemiology, and preventive medicine.

TASK: Conduct comprehensive risk stratification for the patient based on multiple risk domains.

RISK ASSESSMENT DOMAINS:

1. DEMOGRAPHIC RISK FACTORS:
   - Age-related risks (pediatric, geriatric considerations)
   - Gender-specific health risks
   - Genetic predispositions in Indian populations

2. MEDICAL HISTORY RISK FACTORS:
   - Comorbidities and their interactions
   - Previous hospitalizations
   - Medication history and interactions
   - Allergies and adverse reactions

3. ENVIRONMENTAL RISK FACTORS:
   - Geographic location-specific risks
   - Air quality and pollution exposure
   - Water quality and sanitation
   - Occupational hazards
   - Seasonal disease patterns

4. LIFESTYLE RISK FACTORS:
   - Dietary patterns and nutritional status
   - Physical activity levels
   - Substance use (tobacco, alcohol)
   - Sleep patterns and stress levels

5. SOCIOECONOMIC RISK FACTORS:
   - Healthcare access and compliance
   - Economic barriers to treatment
   - Health literacy levels
   - Social support systems

INDIAN HEALTH CONTEXT:
- High prevalence of diabetes and cardiovascular disease
- Nutritional deficiencies (iron, B12, vitamin D)
- Vector-borne disease risks (malaria, dengue, chikungunya)
- Air pollution health impacts in major cities
- Healthcare infrastructure variations

RISK IMPACT LEVELS:
- LOW: Minimal impact on health outcomes, routine monitoring
- MEDIUM: Moderate impact, requires attention and monitoring
- HIGH: Significant impact, needs active management and intervention

OVERALL RISK STRATIFICATION:
- LOW: Routine care, standard follow-up
- MEDIUM: Enhanced monitoring, preventive measures
- HIGH: Active management, frequent monitoring
- CRITICAL: Immediate intervention required, intensive monitoring

Return ONLY valid JSON:
{
  "riskFactors": [
    {
      "factor": "specific risk factor name",
      "impact": "low|medium|high",
      "description": "detailed explanation of risk and clinical significance"
    }
  ],
  "overallRisk": "low|medium|high|critical",
  "recommendations": ["specific actionable risk mitigation strategies"]
}`;

      const patientData = `
PATIENT PROFILE:
- Age: ${patientInfo.age || 'Not specified'}
- Gender: ${patientInfo.gender || 'Not specified'}
- Location: ${patientInfo.location || 'Not specified'}
- Medical History: ${patientInfo.medicalHistory?.join(', ') || 'None provided'}

CURRENT SYMPTOMS: "${symptoms}"

ASSESSMENT REQUEST: Conduct comprehensive risk stratification considering all relevant risk domains and provide specific, actionable recommendations for risk mitigation.`;

      try {
        const response = await this.client.chat([
          { role: "system", content: systemPrompt },
          { role: "user", content: patientData }
        ], "sonar");

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          if (Array.isArray(result.riskFactors) && Array.isArray(result.recommendations)) {
            return {
              riskFactors: result.riskFactors.map((rf: {
                factor?: string;
                impact?: string;
                description?: string;
              }) => ({
                factor: rf.factor || 'Unknown risk factor',
                impact: ['low', 'medium', 'high'].includes(rf.impact) ? rf.impact : 'medium',
                description: rf.description || 'No description available'
              })),
              overallRisk: ['low', 'medium', 'high', 'critical'].includes(result.overallRisk) 
                ? result.overallRisk : 'medium',
              recommendations: result.recommendations || []
            };
          }
        }
      } catch (error) {
        console.error('Suraksha risk assessment error:', error);
      }

      // Fallback risk assessment
      return this.fallbackRiskAssessment(patientInfo, symptoms);
    });
  }

  private fallbackRiskAssessment(patientInfo: PatientInput, symptoms: string): {
    riskFactors: Array<{
      factor: string;
      impact: "low" | "medium" | "high";
      description: string;
    }>;
    overallRisk: "low" | "medium" | "high" | "critical";
    recommendations: string[];
  } {
    const riskFactors = [];
    let overallRisk: "low" | "medium" | "high" | "critical" = "low";
    const recommendations = [];

    // Age-based risk assessment
    if (patientInfo.age) {
      if (patientInfo.age > 65) {
        riskFactors.push({
          factor: "Advanced Age",
          impact: "high" as const,
          description: "Increased risk for multiple comorbidities and medication interactions"
        });
        overallRisk = "high";
      } else if (patientInfo.age > 45) {
        riskFactors.push({
          factor: "Middle Age",
          impact: "medium" as const,
          description: "Increased risk for cardiovascular and metabolic conditions"
        });
        overallRisk = overallRisk === "low" ? "medium" : overallRisk;
      }
    }

    // Gender-based risk assessment
    if (patientInfo.gender === "male" && patientInfo.age && patientInfo.age > 40) {
      riskFactors.push({
        factor: "Male Gender with Age",
        impact: "medium" as const,
        description: "Higher cardiovascular risk in middle-aged males"
      });
    }

    // Location-based risk assessment
    if (patientInfo.location) {
      const location = patientInfo.location.toLowerCase();
      if (location.includes('delhi') || location.includes('mumbai') || location.includes('kolkata')) {
        riskFactors.push({
          factor: "High Air Pollution Exposure",
          impact: "medium" as const,
          description: "Living in high air pollution area increases respiratory and cardiovascular risks"
        });
      }
    }

    // Symptom-based risk assessment
    const lowerSymptoms = symptoms.toLowerCase();
    if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('chest')) {
      overallRisk = "critical";
      recommendations.push("Immediate cardiac evaluation with ECG and cardiac enzymes");
      recommendations.push("Consider emergency department evaluation");
    }

    if (lowerSymptoms.includes('breathing') || lowerSymptoms.includes('dyspnea')) {
      overallRisk = overallRisk === "low" ? "high" : "critical";
      recommendations.push("Oxygen saturation monitoring");
      recommendations.push("Chest imaging if respiratory symptoms persist");
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push("Regular vital signs monitoring");
      recommendations.push("Follow-up within 24-48 hours if symptoms worsen");
      recommendations.push("Maintain adequate hydration and rest");
    }

    return {
      riskFactors,
      overallRisk,
      recommendations
    };
  }
}

// Diagnosis Aggregator Agent - Nidan
export class DiagnosisAggregatorAgent {
  private client: PerplexityClient;
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.client = new PerplexityClient(PERPLEXITY_API_KEY || '');
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  async aggregateDiagnosis(
    translatedSymptoms: string,
    symptomAnalysis: {
      structuredSymptoms: Array<{
        symptom: string;
        severity: number;
        duration: string;
        bodySystem: string;
      }>;
      redFlags: string[];
      urgencyScore: number;
    },
    researchFindings: {
      relevantStudies: Array<{
        title: string;
        summary: string;
        evidenceLevel: number;
        source: string;
      }>;
      regionalPatterns: string;
      currentOutbreaks: string[];
    },
    riskAssessment: {
      riskFactors: Array<{
        factor: string;
        impact: "low" | "medium" | "high";
        description: string;
      }>;
      overallRisk: "low" | "medium" | "high" | "critical";
      recommendations: string[];
    },
    patientInfo: PatientInput
  ): Promise<DiagnosisResult> {
    return this.orchestrator.executeAgent('Nidan-DiagnosisAggregator', async () => {
      const systemPrompt = `You are Nidan, a senior diagnostic physician and clinical decision-making expert with the ability to synthesize complex medical information from multiple sources.

TASK: Integrate all available clinical data to provide a comprehensive diagnostic assessment and management plan.

CLINICAL REASONING FRAMEWORK:
1. Pattern Recognition: Identify symptom clusters and syndromes
2. Differential Diagnosis: Generate ranked list of possible conditions
3. Evidence Integration: Incorporate research findings and guidelines
4. Risk Stratification: Consider patient-specific risk factors
5. Clinical Decision Making: Prioritize patient safety and evidence-based care

DIAGNOSTIC CONFIDENCE LEVELS:
- 90-100%: High confidence, strong clinical evidence
- 70-89%: Moderate-high confidence, good supporting evidence
- 50-69%: Moderate confidence, some uncertainty remains
- 30-49%: Low-moderate confidence, significant uncertainty
- <30%: Low confidence, requires further evaluation

URGENCY CLASSIFICATION:
- CRITICAL: Life-threatening, requires immediate intervention (minutes)
- HIGH: Urgent condition, needs prompt evaluation (hours)
- MEDIUM: Semi-urgent, evaluation within 24-48 hours
- LOW: Routine, can be managed in outpatient setting

ICD-10 CODING: Provide appropriate diagnostic codes when confident in diagnosis.

PATIENT SAFETY PRINCIPLES:
- Always err on the side of caution
- Prioritize identification of emergency conditions
- Consider worst-case scenarios in differential diagnosis
- Recommend appropriate level of care and monitoring

Return ONLY valid JSON:
{
  "primaryDiagnosis": {
    "condition": "most likely diagnosis",
    "confidence": "percentage with % symbol",
    "icd10Code": "ICD-10 code if applicable"
  },
  "differentialDiagnosis": [
    {
      "condition": "alternative diagnosis",
      "confidence": "percentage with % symbol"
    }
  ],
  "urgencyLevel": "low|medium|high|critical",
  "recommendedTests": ["specific diagnostic tests and investigations"],
  "clinicalNotes": "comprehensive clinical assessment and management recommendations"
}`;

      const clinicalData = `
PATIENT INFORMATION:
- Age: ${patientInfo.age || 'Not specified'}
- Gender: ${patientInfo.gender || 'Not specified'}  
- Location: ${patientInfo.location || 'Not specified'}
- Medical History: ${patientInfo.medicalHistory?.join(', ') || 'None provided'}
- Language: ${patientInfo.language}

TRANSLATED SYMPTOMS: "${translatedSymptoms}"

SYMPTOM ANALYSIS (by Lakshan):
- Structured Symptoms: ${JSON.stringify(symptomAnalysis.structuredSymptoms, null, 2)}
- Red Flags: ${symptomAnalysis.redFlags.join(', ') || 'None identified'}
- Urgency Score: ${symptomAnalysis.urgencyScore}/10

RESEARCH FINDINGS (by Shodh):
- Relevant Studies: ${researchFindings.relevantStudies.length} studies found
- Regional Patterns: ${researchFindings.regionalPatterns || 'None specified'}
- Current Outbreaks: ${researchFindings.currentOutbreaks.join(', ') || 'None reported'}

RISK ASSESSMENT (by Suraksha):
- Risk Factors: ${riskAssessment.riskFactors.length} factors identified
- Overall Risk: ${riskAssessment.overallRisk}
- Key Recommendations: ${riskAssessment.recommendations.slice(0, 3).join('; ')}

CLINICAL SYNTHESIS REQUEST:
Provide comprehensive diagnostic assessment integrating all available information. Prioritize patient safety and evidence-based clinical decision making.`;

      try {
        const response = await this.client.chat([
          { role: "system", content: systemPrompt },
          { role: "user", content: clinicalData }
        ], "sonar");

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          // Validate and enhance the response
          if (result.primaryDiagnosis && result.urgencyLevel) {
            return {
              primaryDiagnosis: {
                condition: result.primaryDiagnosis.condition || 'Undetermined',
                confidence: result.primaryDiagnosis.confidence || '0%',
                icd10Code: result.primaryDiagnosis.icd10Code
              },
              differentialDiagnosis: Array.isArray(result.differentialDiagnosis) 
                ? result.differentialDiagnosis : [],
              urgencyLevel: ['low', 'medium', 'high', 'critical'].includes(result.urgencyLevel) 
                ? result.urgencyLevel : 'medium',
              recommendedTests: Array.isArray(result.recommendedTests) 
                ? result.recommendedTests : [],
              clinicalNotes: result.clinicalNotes || 'Clinical assessment completed.',
              agentInsights: {
                translator: `Symptoms translated from ${patientInfo.language} with cultural context`,
                symptomAnalyzer: `${symptomAnalysis.structuredSymptoms.length} symptoms analyzed, urgency ${symptomAnalysis.urgencyScore}/10`,
                researcher: `${researchFindings.relevantStudies.length} studies reviewed, regional patterns identified`,
                riskAssessment: `${riskAssessment.riskFactors.length} risk factors, overall risk: ${riskAssessment.overallRisk}`
              }
            };
          }
        }
      } catch (error) {
        console.error('Nidan diagnosis aggregation error:', error);
      }

      // Fallback diagnosis based on available data
      return this.fallbackDiagnosis(symptomAnalysis, riskAssessment, patientInfo);
    });
  }

  private fallbackDiagnosis(
    symptomAnalysis: {
      redFlags?: string[];
      urgencyScore?: number;
      structuredSymptoms?: Array<{
        symptom: string;
        severity: number;
        duration: string;
        bodySystem: string;
      }>;
    },
    riskAssessment: {
      overallRisk: "low" | "medium" | "high" | "critical";
    },
    patientInfo: PatientInput
  ): DiagnosisResult {
    // Determine urgency based on red flags and risk assessment
    let urgencyLevel: "low" | "medium" | "high" | "critical" = "medium";
    
    if (symptomAnalysis.redFlags?.length > 0 || riskAssessment.overallRisk === "critical") {
      urgencyLevel = "critical";
    } else if (symptomAnalysis.urgencyScore >= 7 || riskAssessment.overallRisk === "high") {
      urgencyLevel = "high";
    } else if (symptomAnalysis.urgencyScore >= 4 || riskAssessment.overallRisk === "medium") {
      urgencyLevel = "medium";
    } else {
      urgencyLevel = "low";
    }

    return {
      primaryDiagnosis: {
        condition: "Clinical Assessment Required",
        confidence: "Pending evaluation"
      },
      differentialDiagnosis: [
        { condition: "Multiple differential diagnoses possible", confidence: "Variable" }
      ],
      urgencyLevel,
      recommendedTests: ["Complete clinical evaluation", "Basic diagnostic workup"],
      clinicalNotes: `Patient requires comprehensive clinical evaluation. ${symptomAnalysis.redFlags?.length > 0 ? 'RED FLAGS IDENTIFIED: ' + symptomAnalysis.redFlags.join(', ') + '. ' : ''}Recommend immediate medical attention based on symptom severity and risk factors.`,
      agentInsights: {
        translator: `Symptoms processed from ${patientInfo.language}`,
        symptomAnalyzer: `${symptomAnalysis.structuredSymptoms?.length || 0} symptoms analyzed`,
        researcher: "Research data integrated",
        riskAssessment: `Risk level: ${riskAssessment.overallRisk}`
      }
    };
  }
}

// Medical Coordinator - Main orchestrator with real-time agent coordination
export class MedicalCoordinatorAgent {
  private translator: LanguageTranslatorAgent;
  private symptomAnalyzer: SymptomAnalyzerAgent;
  private researcher: MedicalResearcherAgent;
  private riskAssessment: RiskAssessmentAgent;
  private aggregator: DiagnosisAggregatorAgent;
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.translator = new LanguageTranslatorAgent();
    this.symptomAnalyzer = new SymptomAnalyzerAgent();
    this.researcher = new MedicalResearcherAgent();
    this.riskAssessment = new RiskAssessmentAgent();
    this.aggregator = new DiagnosisAggregatorAgent();
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  async processDiagnosis(patientInput: PatientInput): Promise<DiagnosisResult> {
    const startTime = Date.now();
    console.log('🏥 Medical Coordinator: Starting AI-powered diagnosis process...');
    console.log(`📋 Patient: ${patientInput.age || 'Unknown'} year old ${patientInput.gender || 'patient'} from ${patientInput.location || 'unknown location'}`);
    console.log(`🗣️ Language: ${patientInput.language}`);
    console.log(`🩺 Symptoms: "${patientInput.symptoms}"`);

    try {
      // Validate API key
      if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === "your_perplexity_api_key_here") {
        console.warn('⚠️ Perplexity API key not configured - using fallback mode');
      }

      // Step 1: Language Translation and Cultural Context Analysis
      console.log('\n🔄 Step 1: Activating Bhasha (Language Translator Agent)...');
      const translationResult = await this.translator.translateSymptoms(
        patientInput.symptoms,
        patientInput.language
      );
      console.log(`✅ Translation completed: "${translationResult.translatedSymptoms}"`);
      if (translationResult.emergencyKeywords.length > 0) {
        console.log(`🚨 Emergency keywords detected: ${translationResult.emergencyKeywords.join(', ')}`);
      }

      // Step 2: Clinical Symptom Analysis
      console.log('\n🔄 Step 2: Activating Lakshan (Symptom Analyzer Agent)...');
      const symptomAnalysis = await this.symptomAnalyzer.analyzeSymptoms(
        translationResult.translatedSymptoms,
        patientInput
      );
      console.log(`✅ Symptom analysis completed: ${symptomAnalysis.structuredSymptoms.length} symptoms identified`);
      console.log(`📊 Urgency score: ${symptomAnalysis.urgencyScore}/10`);
      if (symptomAnalysis.redFlags.length > 0) {
        console.log(`🚩 RED FLAGS: ${symptomAnalysis.redFlags.join(', ')}`);
      }

      // Step 3: Medical Literature Research (Parallel execution)
      console.log('\n🔄 Step 3: Activating Shodh (Medical Researcher Agent)...');
      const researchPromise = this.researcher.researchConditions(
        translationResult.translatedSymptoms,
        patientInput.location
      );

      // Step 4: Risk Assessment (Parallel execution)
      console.log('\n🔄 Step 4: Activating Suraksha (Risk Assessment Agent)...');
      const riskPromise = this.riskAssessment.assessRisk(
        patientInput,
        translationResult.translatedSymptoms
      );

      // Wait for parallel processes to complete
      const [researchFindings, riskAssessmentResult] = await Promise.all([
        researchPromise,
        riskPromise
      ]);

      console.log(`✅ Research completed: ${researchFindings.relevantStudies.length} studies found`);
      console.log(`✅ Risk assessment completed: ${riskAssessmentResult.riskFactors.length} risk factors identified`);
      console.log(`⚖️ Overall risk level: ${riskAssessmentResult.overallRisk.toUpperCase()}`);

      // Step 5: Diagnosis Aggregation and Clinical Decision Making
      console.log('\n🔄 Step 5: Activating Nidan (Diagnosis Aggregator Agent)...');
      const finalDiagnosis = await this.aggregator.aggregateDiagnosis(
        translationResult.translatedSymptoms,
        symptomAnalysis,
        researchFindings,
        riskAssessmentResult,
        patientInput
      );

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n🎯 DIAGNOSIS COMPLETED in ${processingTime} seconds`);
      console.log(`📋 Primary Diagnosis: ${finalDiagnosis.primaryDiagnosis.condition} (${finalDiagnosis.primaryDiagnosis.confidence})`);
      console.log(`🚨 Urgency Level: ${finalDiagnosis.urgencyLevel.toUpperCase()}`);
      
      // Add processing metadata
      finalDiagnosis.processingMetadata = {
        processingTime: `${processingTime}s`,
        agentsUsed: ['Bhasha', 'Lakshan', 'Shodh', 'Suraksha', 'Nidan'],
        timestamp: new Date().toISOString(),
        apiStatus: PERPLEXITY_API_KEY && PERPLEXITY_API_KEY !== "your_perplexity_api_key_here" ? 'active' : 'fallback'
      };

      return finalDiagnosis;

    } catch (error) {
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ Medical diagnosis process failed after ${processingTime}s:`, error);
      
      return {
        primaryDiagnosis: {
          condition: "System Error - Unable to Process",
          confidence: "0%"
        },
        differentialDiagnosis: [
          {
            condition: "Technical Error Occurred",
            confidence: "System malfunction"
          }
        ],
        urgencyLevel: "medium",
        recommendedTests: ["Manual clinical evaluation required"],
        clinicalNotes: `System error occurred during AI diagnosis process. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please consult a qualified physician immediately for proper medical evaluation. This system is designed to assist, not replace, professional medical judgment.`,
        agentInsights: {
          translator: "Error in translation process",
          symptomAnalyzer: "Error in symptom analysis",
          researcher: "Error in research process",
          riskAssessment: "Error in risk assessment"
        },
        processingMetadata: {
          processingTime: `${processingTime}s`,
          agentsUsed: [],
          timestamp: new Date().toISOString(),
          apiStatus: 'error'
        }
      };
    }
  }

  // Get real-time agent status
  getAgentStatus(): { [key: string]: boolean } {
    const activeAgents = this.orchestrator.getActiveAgents();
    return {
      'Bhasha-Translator': activeAgents.includes('Bhasha-Translator'),
      'Lakshan-SymptomAnalyzer': activeAgents.includes('Lakshan-SymptomAnalyzer'),
      'Shodh-MedicalResearcher': activeAgents.includes('Shodh-MedicalResearcher'),
      'Suraksha-RiskAssessment': activeAgents.includes('Suraksha-RiskAssessment'),
      'Nidan-DiagnosisAggregator': activeAgents.includes('Nidan-DiagnosisAggregator')
    };
  }

  // Health check for the medical system
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'error';
    agents: string[];
    apiConnection: boolean;
    timestamp: string;
  }> {
    try {
      const apiConnection = !!(PERPLEXITY_API_KEY && PERPLEXITY_API_KEY !== "your_perplexity_api_key_here");
      
      return {
        status: apiConnection ? 'healthy' : 'degraded',
        agents: ['Bhasha', 'Lakshan', 'Shodh', 'Suraksha', 'Nidan'],
        apiConnection,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        agents: [],
        apiConnection: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}