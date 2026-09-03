export type InterpretationInput={
  finding:string;clientProduct:string;clientObjective:string;score:number;evidenceConfidence:number;
  positives:string[];uncertainties:string[];nextAction:string;evidenceIds:string[];
};
export type FindingInterpretation={whatWeFound:string;whyItMatters:string;score:number;evidenceConfidence:number;whyThisScore:string[];unknowns:string[];recommendedNextAction:string;evidenceIds:string[];provider:"DETERMINISTIC"|"AI"};

export interface IntelligenceInterpretationProvider{interpret(input:InterpretationInput):Promise<FindingInterpretation>}

export class DeterministicInterpretationService implements IntelligenceInterpretationProvider{
  async interpret(input:InterpretationInput):Promise<FindingInterpretation>{
    return{whatWeFound:input.finding,whyItMatters:`This may matter to ${input.clientProduct} because it relates to ${input.clientObjective}.`,score:input.score,evidenceConfidence:input.evidenceConfidence,whyThisScore:input.positives.slice(0,3).concat(input.uncertainties[0]?[`Uncertainty: ${input.uncertainties[0]}`]:[]),unknowns:input.uncertainties,recommendedNextAction:input.nextAction,evidenceIds:input.evidenceIds,provider:"DETERMINISTIC"};
  }
}
