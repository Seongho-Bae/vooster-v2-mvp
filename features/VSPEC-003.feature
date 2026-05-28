Feature: Export to Gherkin

  Background:
    Given the use case is in scope vspec

  Scenario: Main success
    When ai-agent requests a Gherkin export for a use case key
    When system parses the use case file
    When system renders deterministic feature text
    When system writes the feature file to the requested path

  Scenario: 2a The use case key does not exist
    Given main success reaches step 2
    When system returns a key not found error
    When ai-agent lists use cases and selects a valid key
    Then outcome is FAILURE
