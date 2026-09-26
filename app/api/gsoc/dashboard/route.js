import dbConnect from '@/lib/mongodb';
import GSoCGoal from '@/models/GSoCGoal';
import GSoCSkill from '@/models/GSoCSkill';
import GSoCProject from '@/models/GSoCProject';
import GSoCOrganization from '@/models/GSoCOrganization';
import GSoCContribution from '@/models/GSoCContribution';
import GSoCCommunityInteraction from '@/models/GSoCCommunityInteraction';
import GSoCExperiment from '@/models/GSoCExperiment';
import GSoCProposal from '@/models/GSoCProposal';
import GSoCEvidence from '@/models/GSoCEvidence';

export async function GET() {
  try {
    await dbConnect();

    // Get or create the main GSoC goal
    let goal = await GSoCGoal.findOne({ targetYear: 2027 });
    if (!goal) {
      goal = await GSoCGoal.create({
        targetYear: 2027,
        focusArea: 'AI/ML + Python',
        currentReadinessLevel: 'LEVEL_0',
        overallEvidenceLevel: 'NONE',
        currentGate: 'L1'
      });
    }

    // Get counts and stats
    const skillsCount = await GSoCSkill.countDocuments();
    const strongSkills = await GSoCSkill.countDocuments({ 'evidenceLevel.level': 'STRONG' });
    const projectsCount = await GSoCProject.countDocuments();
    const experimentsCount = await GSoCExperiment.countDocuments();
    const organizationsCount = await GSoCOrganization.countDocuments();
    const contributionsCount = await GSoCContribution.countDocuments();
    const communityInteractions = await GSoCCommunityInteraction.countDocuments();
    const proposalsCount = await GSoCProposal.countDocuments();
    const mergedPRs = await GSoCContribution.countDocuments({ status: 'MERGED' });

    // Calculate readiness percentages based on evidence
    const technicalReadiness = skillsCount > 0 ? Math.round((strongSkills / Math.max(1, skillsCount)) * 100) : 0;
    const projectEvidence = projectsCount > 0 ? Math.min(100, projectsCount * 25) : 0;
    const openSourceReadiness = contributionsCount > 0 ? Math.min(100, (mergedPRs / Math.max(1, contributionsCount)) * 100) : 0;
    const organizationReadiness = organizationsCount > 0 ? Math.min(100, organizationsCount * 20) : 0;
    const communityReadiness = communityInteractions > 0 ? Math.min(100, communityInteractions * 10) : 0;
    const proposalReadiness = proposalsCount > 0 ? Math.min(100, proposalsCount * 33) : 0;

    // Update goal with calculated readiness
    goal.technicalReadiness = technicalReadiness;
    goal.projectEvidence = projectEvidence;
    goal.openSourceReadiness = openSourceReadiness;
    goal.organizationReadiness = organizationReadiness;
    goal.communityReadiness = communityReadiness;
    goal.proposalReadiness = proposalReadiness;

    // Calculate overall readiness level
    const avgReadiness = (technicalReadiness + projectEvidence + openSourceReadiness + organizationReadiness + communityReadiness + proposalReadiness) / 6;
    if (avgReadiness >= 90) goal.currentReadinessLevel = 'LEVEL_6';
    else if (avgReadiness >= 75) goal.currentReadinessLevel = 'LEVEL_5';
    else if (avgReadiness >= 60) goal.currentReadinessLevel = 'LEVEL_4';
    else if (avgReadiness >= 45) goal.currentReadinessLevel = 'LEVEL_3';
    else if (avgReadiness >= 30) goal.currentReadinessLevel = 'LEVEL_2';
    else if (avgReadiness >= 15) goal.currentReadinessLevel = 'LEVEL_1';
    else goal.currentReadinessLevel = 'LEVEL_0';

    // Calculate overall evidence level
    const strongEvidenceCount = strongSkills + Math.floor(projectsCount / 2) + mergedPRs;
    if (strongEvidenceCount >= 10) goal.overallEvidenceLevel = 'EXCELLENT';
    else if (strongEvidenceCount >= 7) goal.overallEvidenceLevel = 'STRONG';
    else if (strongEvidenceCount >= 5) goal.overallEvidenceLevel = 'GOOD';
    else if (strongEvidenceCount >= 3) goal.overallEvidenceLevel = 'BASIC';
    else if (strongEvidenceCount >= 1) goal.overallEvidenceLevel = 'WEAK';
    else goal.overallEvidenceLevel = 'NONE';

    await goal.save();

    // Generate missing evidence using the evidence engine
    const missingEvidence = [];
    
    if (technicalReadiness < 50) {
      missingEvidence.push({
        priority: 'HIGH',
        category: 'Technical Skills',
        description: 'Technical foundation below 50%',
        action: 'Focus on core Python and ML skills'
      });
    }
    
    if (projectsCount < 2) {
      missingEvidence.push({
        priority: 'HIGH',
        category: 'ML Projects',
        description: 'Need at least 2 substantial ML projects',
        action: 'Build and document ML projects with quality checklists'
      });
    }
    
    if (mergedPRs < 1) {
      missingEvidence.push({
        priority: 'HIGH',
        category: 'Open Source',
        description: 'No merged PRs yet',
        action: 'Make first contribution to target organization'
      });
    }
    
    if (communityInteractions < 3) {
      missingEvidence.push({
        priority: 'HIGH',
        category: 'Community',
        description: 'Limited community interaction',
        action: 'Participate in organization discussions and forums'
      });
    }
    
    if (proposalsCount === 0) {
      missingEvidence.push({
        priority: 'HIGH',
        category: 'Proposal',
        description: 'No proposal draft started',
        action: 'Begin drafting proposal with evidence linking'
      });
    }

    // Get proposal sections completion
    let proposalSections = 0;
    let evidenceLinked = 0;
    if (proposalsCount > 0) {
      const latestProposal = await GSoCProposal.findOne().sort({ createdAt: -1 });
      if (latestProposal) {
        proposalSections = latestProposal.sections.filter(s => s.status === 'COMPLETE').length;
        evidenceLinked = latestProposal.sections.reduce((acc, s) => acc + (s.evidenceLinks?.length || 0), 0);
      }
    }

    // Get target organizations
    const targetOrganizations = await GSoCOrganization.countDocuments({ status: { $in: ['INTERESTED', 'ACTIVE'] } });

    // Get network strength based on community interactions
    let networkStrength = 'Low';
    if (communityInteractions >= 10) networkStrength = 'High';
    else if (communityInteractions >= 5) networkStrength = 'Medium';

    const stats = {
      skillsCount,
      strongSkills,
      projectsCount,
      experimentsCount,
      organizationsCount,
      contributionsCount,
      communityInteractions,
      proposalsCount,
      mergedPRs,
      githubRepos: projectsCount, // Assuming projects have GitHub repos
      mlProjects: await GSoCProject.countDocuments({ domain: { $in: ['MACHINE_LEARNING', 'DEEP_LEARNING', 'NLP', 'COMPUTER_VISION'] } }),
      totalExperiments: experimentsCount,
      targetOrganizations,
      discussionsCount: communityInteractions,
      networkStrength,
      proposalSections,
      evidenceLinked
    };

    return Response.json({
      success: true,
      data: {
        goal,
        stats,
        missingEvidence
      }
    });

  } catch (error) {
    console.error('GSoC Dashboard API Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}