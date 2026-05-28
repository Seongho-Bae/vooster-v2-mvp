Feature: Promote a goal to a use case

  Background:
    Given the use case is in scope vspec

  Scenario: Main success
    When ai-agent selects a goal id to promote
    When system allocates the next use case key
    When system writes a use case skeleton from the goal
    When system marks the goal as PROMOTED and records the linked use case key
    When ai-agent completes and validates the new use case

  Scenario: 1a Goal id is unknown
    Given main success reaches step 1
    When system reports that the goal was not found
    When ai-agent lists goals to choose a valid id
    Then outcome is FAILURE
