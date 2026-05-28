Feature: Follow ai guide

  Background:
    Given the use case is in scope vspec

  Scenario: Main success
    When ai-agent reads the ai-guide output
    When ai-agent creates or confirms referenced actors and stakeholders
    When ai-agent authors a use case markdown file
    When system validates the use case with doctor
    When system exports a Gherkin feature file

  Scenario: 2a Referenced entity already exists
    Given main success reaches step 2
    When system reports that the entity already exists
    When ai-agent reuses the existing entity
    Then outcome is SUCCESS
