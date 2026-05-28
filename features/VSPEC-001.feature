Feature: Author a use case

  Background:
    Given the use case is in scope vspec

  Scenario: Main success
    When developer names the behavior to specify
    When ai-agent creates or selects the next use case key
    When ai-agent writes the use case markdown with all canonical sections
    When system normalizes and parses the file successfully
    When ai-agent runs doctor and resolves findings

  Scenario: 3a Required detail is unknown
    Given main success reaches step 3
    When ai-agent writes the unknown as an empty section or explicit note
    When ai-agent keeps the file parseable
    Then outcome is PARTIAL
