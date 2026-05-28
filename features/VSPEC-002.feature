Feature: Validate specs

  Background:
    Given the use case is in scope vspec

  Scenario: Main success
    When ai-agent runs doctor over the specs tree
    When system reads use cases, actors, and stakeholders from disk
    When system checks Cockburn rules and cross references
    When system reports every error and warning
    When ai-agent fixes the files until no errors remain

  Scenario: 2a A referenced file is missing
    Given main success reaches step 2
    When system reports the missing actor or stakeholder
    When ai-agent creates the missing entity file
    Then outcome is PARTIAL
