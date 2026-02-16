const CLASS_TYPE_STRATEGIES = {
  controller: `CLASS TYPE: REST Controller
TEST STRATEGY:
- Use @WebMvcTest or MockMvc for HTTP-level testing
- Test each endpoint's HTTP method (GET, POST, PUT, DELETE)
- Verify correct HTTP status codes (200, 201, 400, 404, 500)
- Test request validation (@Valid, @RequestBody, @PathVariable, @RequestParam)
- Test response body structure and content
- Mock the service layer with @MockBean
- Test error responses and exception handlers
- Verify correct Content-Type headers`,

  service: `CLASS TYPE: Business Service
TEST STRATEGY:
- Use @ExtendWith(MockitoExtension.class) for unit testing
- Mock all dependencies (@Mock for repositories, other services)
- Focus on business logic correctness
- Test all conditional branches and decision paths
- Verify interactions with mocked dependencies (verify() calls)
- Test transaction boundaries if applicable
- Cover all edge cases in business rules`,

  repository: `CLASS TYPE: Data Repository
TEST STRATEGY:
- Use @DataJpaTest with embedded H2 database
- Test custom query methods
- Verify CRUD operations work correctly
- Test query results with specific test data
- Use @BeforeEach to set up test entities
- Test pagination and sorting if applicable
- Verify cascading operations`,

  entity: `CLASS TYPE: JPA Entity
TEST STRATEGY:
- Test equals() and hashCode() contract
- Test all validation constraints (@NotNull, @Size, @Email, etc.)
- Test entity relationships (OneToMany, ManyToOne, etc.)
- Test builder/constructor patterns
- Verify getters and setters
- Test toString() output
- Use Jakarta Validation API for constraint testing`,

  dto: `CLASS TYPE: Data Transfer Object
TEST STRATEGY:
- Test serialization/deserialization (Jackson ObjectMapper)
- Test all getters and setters
- Test builder pattern if present
- Test validation annotations
- Test equals/hashCode if implemented
- Verify no-args and all-args constructors`,

  utility: `CLASS TYPE: Utility Class
TEST STRATEGY:
- Test all static methods independently
- Focus on pure function input/output testing
- Test with many edge case inputs
- Verify null handling
- Test boundary values extensively
- Each method should have multiple test cases`,

  config: `CLASS TYPE: Configuration Class
TEST STRATEGY:
- Test that beans are created correctly
- Test conditional bean loading (@ConditionalOn...)
- Verify bean properties and configuration values
- Test with different profiles if applicable`,

  component: `CLASS TYPE: Spring Component
TEST STRATEGY:
- Use @ExtendWith(MockitoExtension.class)
- Mock dependencies
- Test component logic similar to service testing
- Verify lifecycle methods if present`,
};

export function buildPrompt(code, notes, casePriorities, methodPriorities = {}, classType = 'unknown', pomInfo = null, annotations = []) {
  const edgeCaseDescriptions = {
    null: "Null inputs and null returns",
    empty: "Empty collections (List, Set, Map, arrays, empty strings)",
    boundary: "Boundary values (0, -1, Integer.MAX_VALUE, Integer.MIN_VALUE)",
    exception: "Exception scenarios (expected exceptions, error handling)",
    concurrent: "Concurrent access patterns and thread safety"
  };

  // Build edge cases section with priorities
  const edgeCaseLines = Object.entries(casePriorities)
    .filter(([_, priority]) => priority !== 'off')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a[1]] - order[b[1]];
    })
    .map(([caseId, priority]) => {
      const desc = edgeCaseDescriptions[caseId] || caseId;
      return `- [${priority.toUpperCase()}] ${desc}`;
    })
    .join('\n');

  // Parse @method tags from notes
  const taggedMethods = notes.match(/@(\w+)/g) || [];
  const uniqueTags = [...new Set(taggedMethods.map(t => t.slice(1)))];

  let notesSection = '';
  if (notes?.trim()) {
    notesSection = `\nBUSINESS LOGIC NOTES (from the developer):\n${notes}\n`;
    if (uniqueTags.length > 0) {
      notesSection += `\n⚠️ The developer has specifically tagged these methods with @: ${uniqueTags.join(', ')}\n`;
      notesSection += `Pay special attention to the business rules described for each tagged method.\n`;
      notesSection += `The notes use @methodName to indicate which method a rule applies to.\n`;
    }
  }

  // Build method priority section
  const methodEntries = Object.entries(methodPriorities).filter(([_, level]) => level !== 'skip');
  const criticalMethods = methodEntries.filter(([_, l]) => l === 'critical').map(([name]) => name);
  const importantMethods = methodEntries.filter(([_, l]) => l === 'important').map(([name]) => name);
  const normalMethods = methodEntries.filter(([_, l]) => l === 'normal').map(([name]) => name);
  const skippedMethods = Object.entries(methodPriorities).filter(([_, l]) => l === 'skip').map(([name]) => name);

  let methodSection = '';
  if (Object.keys(methodPriorities).length > 0) {
    methodSection = '\nMETHOD PRIORITIES (set by the developer):\n';
    if (criticalMethods.length > 0) {
      methodSection += `CRITICAL (generate exhaustive tests, cover every edge case): ${criticalMethods.join(', ')}\n`;
    }
    if (importantMethods.length > 0) {
      methodSection += `IMPORTANT (generate thorough tests): ${importantMethods.join(', ')}\n`;
    }
    if (normalMethods.length > 0) {
      methodSection += `NORMAL (generate standard tests): ${normalMethods.join(', ')}\n`;
    }
    if (skippedMethods.length > 0) {
      methodSection += `SKIP (do NOT generate tests for these): ${skippedMethods.join(', ')}\n`;
    }
  }

  // Build class type strategy section
  const classStrategy = CLASS_TYPE_STRATEGIES[classType] || '';

  // Build dependency/pom info section
  let pomSection = '';
  if (pomInfo) {
    pomSection = '\nPROJECT DEPENDENCIES (from pom.xml):\n';
    if (pomInfo.javaVersion) {
      pomSection += `- Java version: ${pomInfo.javaVersion}\n`;
    }
    if (pomInfo.testFramework === 'junit5') {
      pomSection += '- Test framework: JUnit 5 (jupiter) — use org.junit.jupiter.api.* imports\n';
    } else if (pomInfo.testFramework === 'junit4') {
      pomSection += '- Test framework: JUnit 4 — use org.junit.* imports, @Test from org.junit.Test, use @RunWith instead of @ExtendWith\n';
    }
    if (pomInfo.mockingLib === 'mockito') {
      pomSection += '- Mocking: Mockito available — use @Mock, @InjectMocks, when/thenReturn\n';
    } else {
      pomSection += '- Mocking: No Mockito found — use manual stubs or constructor injection for testing\n';
    }
    if (pomInfo.assertionLib === 'assertj') {
      pomSection += '- Assertions: AssertJ available — prefer assertThat() fluent assertions\n';
    } else if (pomInfo.assertionLib === 'hamcrest') {
      pomSection += '- Assertions: Hamcrest available — use assertThat with matchers\n';
    } else {
      pomSection += '- Assertions: Use standard JUnit assertions (assertEquals, assertTrue, assertThrows)\n';
    }
    if (pomInfo.springBoot) {
      pomSection += '- Spring Boot project: @SpringBootTest, @MockBean available\n';
    }
    if (pomInfo.springWeb) {
      pomSection += '- Spring Web: MockMvc available for controller testing\n';
    }
    if (pomInfo.springJpa) {
      pomSection += '- Spring Data JPA: @DataJpaTest available for repository testing\n';
    }
    if (pomInfo.hasH2) {
      pomSection += '- H2 database: Available for integration tests\n';
    }
    if (pomInfo.hasLombok) {
      pomSection += '- Lombok: Project uses Lombok — respect @Data, @Builder, @AllArgsConstructor etc.\n';
    }
    pomSection += '\nIMPORTANT: Only use libraries and imports that exist in the project dependencies above. Do NOT import libraries the project does not have.\n';
  }

  // Build annotations section
  let annotationSection = '';
  if (annotations && annotations.length > 0) {
    annotationSection = '\nDETECTED ANNOTATIONS (adapt tests accordingly):\n';
    const grouped = {};
    annotations.forEach(a => {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });
    for (const [category, anns] of Object.entries(grouped)) {
      annotationSection += `[${category.toUpperCase()}]\n`;
      anns.forEach(a => {
        annotationSection += `- @${a.name}: ${a.testHint}\n`;
      });
    }
    annotationSection += '\nIMPORTANT: Generate tests that specifically address the behavior implied by these annotations.\n';
  }

  // Build requirements based on what's available
  let requirements;
  if (pomInfo?.testFramework === 'junit4') {
    requirements = `REQUIREMENTS:
1. Use JUnit 4 annotations (@Test from org.junit.Test, @Before, @After)
2. Use @RunWith(MockitoJUnitRunner.class) if mocking is needed
3. Include all necessary imports
4. Create separate test methods for each scenario
5. Use descriptive test names following pattern: methodName_shouldBehavior_whenCondition
6. Add meaningful assertions
7. Respect the priority levels
8. Use @Test(expected = Exception.class) for exception testing`;
  } else {
    requirements = `REQUIREMENTS:
1. Use JUnit 5 annotations (@Test, @BeforeEach, @AfterEach if needed)
2. Include all necessary imports (org.junit.jupiter.api.*, static assertions)
3. If the code has dependencies, use Mockito (@Mock, @InjectMocks, @ExtendWith(MockitoExtension.class))
4. Create separate test methods for each scenario
5. Use descriptive test names following pattern: methodName_shouldBehavior_whenCondition
6. Add meaningful assertions that verify business logic
7. Respect the priority levels when deciding how many tests to generate
8. Add brief comments explaining complex test logic
9. Include setup methods (@BeforeEach) if test data needs initialization
10. Use assertThrows() for exception testing
11. Use assertAll() for multiple related assertions`;
    if (pomInfo?.assertionLib === 'assertj') {
      requirements += '\n12. Prefer AssertJ assertThat() fluent assertions over assertEquals';
    }
  }

  return `You are an expert Java test engineer. Generate comprehensive tests for the following code.

JAVA CODE:
\`\`\`java
${code}
\`\`\`
${classStrategy ? '\n' + classStrategy + '\n' : ''}
${pomSection}
${annotationSection}
${methodSection}
${notesSection}
EDGE CASES TO TEST (sorted by priority):
${edgeCaseLines || '- No specific edge cases selected'}

PRIORITY RULES:
- HIGH priority edge cases: Generate multiple thorough test methods covering various scenarios
- MEDIUM priority edge cases: Generate at least one solid test method
- LOW priority edge cases: Generate a basic test if applicable
- Edge cases marked OFF should be skipped entirely

${requirements}

OUTPUT FORMAT:
- Return ONLY the complete Java test class code
- No markdown code blocks, no explanations outside the code
- Ready to copy-paste into an IDE and run immediately
- Ensure proper package declaration if the original code has one`;
}
