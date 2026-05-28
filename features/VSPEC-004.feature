Feature: Scaffold a project

  Background:
    Given the use case is in scope vspec

  Scenario: Main success
    When ai-agent runs init with the chosen key prefix
    When system writes the project config if it is missing
    When system creates specs subdirectories for actors, stakeholders, goals, and use cases
    When system preserves existing files when init is repeated

  Scenario: 2a Config already exists
    Given main success reaches step 2
    When system keeps the existing config file unchanged
    When system still ensures required directories exist
    Then outcome is SUCCESS
