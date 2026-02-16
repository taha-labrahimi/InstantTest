export function extractMethods(javaCode) {
  if (!javaCode || typeof javaCode !== 'string') {
    return [];
  }

  const methods = [];
  
  // Regex to match method declarations (public, private, protected, or default visibility)
  // Matches: [modifiers] returnType methodName(parameters) { ... }
  const methodRegex = /(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)/g;
  
  let match;
  while ((match = methodRegex.exec(javaCode)) !== null) {
    const methodName = match[1];
    const parameters = match[2].trim();
    
    // Skip constructors (method name same as class name) and common non-method keywords
    const skipKeywords = ['class', 'interface', 'enum', 'if', 'while', 'for', 'switch', 'catch'];
    if (!skipKeywords.includes(methodName)) {
      methods.push({
        name: methodName,
        parameters: parameters || 'no parameters',
        signature: `${methodName}(${parameters})`,
        fullMatch: match[0]
      });
    }
  }
  
  return methods;
}

export function extractAnnotations(javaCode) {
  if (!javaCode || typeof javaCode !== 'string') return [];

  const annotations = [];
  const seen = new Set();

  // Match all annotations with optional parameters
  const annotationRegex = /@(\w+)(?:\(([^)]*)\))?/g;
  let match;
  while ((match = annotationRegex.exec(javaCode)) !== null) {
    const name = match[1];
    const params = match[2] || '';
    if (seen.has(name)) continue;
    seen.add(name);

    const info = ANNOTATION_INFO[name];
    if (info) {
      annotations.push({ name, params, ...info });
    }
  }
  return annotations;
}

const ANNOTATION_INFO = {
  // Spring Web
  RestController: { category: 'spring-web', testHint: 'Use MockMvc for HTTP testing, verify JSON responses' },
  Controller: { category: 'spring-web', testHint: 'Use MockMvc, test view resolution and model attributes' },
  RequestMapping: { category: 'spring-web', testHint: 'Test the mapped URL path and HTTP method' },
  GetMapping: { category: 'spring-web', testHint: 'Test GET endpoint with MockMvc, verify response body' },
  PostMapping: { category: 'spring-web', testHint: 'Test POST endpoint, verify request body parsing and 201 status' },
  PutMapping: { category: 'spring-web', testHint: 'Test PUT endpoint, verify update behavior' },
  DeleteMapping: { category: 'spring-web', testHint: 'Test DELETE endpoint, verify 204 or 200 status' },
  PathVariable: { category: 'spring-web', testHint: 'Test with valid/invalid path variables' },
  RequestParam: { category: 'spring-web', testHint: 'Test with present/missing/invalid query parameters' },
  RequestBody: { category: 'spring-web', testHint: 'Test with valid/invalid/null request body JSON' },
  ResponseStatus: { category: 'spring-web', testHint: 'Verify the annotated HTTP status code is returned' },
  ExceptionHandler: { category: 'spring-web', testHint: 'Test that exceptions produce correct error responses' },
  CrossOrigin: { category: 'spring-web', testHint: 'Verify CORS headers in response' },

  // Spring Core
  Service: { category: 'spring-core', testHint: 'Unit test with mocked dependencies' },
  Component: { category: 'spring-core', testHint: 'Unit test with mocked dependencies' },
  Repository: { category: 'spring-core', testHint: 'Use @DataJpaTest with embedded DB' },
  Configuration: { category: 'spring-core', testHint: 'Test bean creation and conditional loading' },
  Bean: { category: 'spring-core', testHint: 'Verify bean is created with correct properties' },
  Autowired: { category: 'spring-core', testHint: 'Use @Mock and @InjectMocks for dependency injection in tests' },
  Value: { category: 'spring-core', testHint: 'Test with ReflectionTestUtils.setField for injected values' },
  Qualifier: { category: 'spring-core', testHint: 'Ensure correct bean is injected when multiple candidates exist' },

  // Transactions & Caching
  Transactional: { category: 'transaction', testHint: 'Test rollback on exception, verify transaction boundaries. Use @Transactional in test to auto-rollback' },
  Cacheable: { category: 'caching', testHint: 'Test that repeated calls return cached result, verify cache key' },
  CacheEvict: { category: 'caching', testHint: 'Test that cache is cleared after method call' },
  CachePut: { category: 'caching', testHint: 'Test that cache is updated with new value' },

  // Validation
  Valid: { category: 'validation', testHint: 'Test with invalid objects to trigger MethodArgumentNotValidException' },
  NotNull: { category: 'validation', testHint: 'Test with null value, expect ConstraintViolationException' },
  NotBlank: { category: 'validation', testHint: 'Test with blank/empty string' },
  NotEmpty: { category: 'validation', testHint: 'Test with empty collection or string' },
  Size: { category: 'validation', testHint: 'Test with values below min and above max size' },
  Min: { category: 'validation', testHint: 'Test with value below minimum' },
  Max: { category: 'validation', testHint: 'Test with value above maximum' },
  Email: { category: 'validation', testHint: 'Test with invalid email formats' },
  Pattern: { category: 'validation', testHint: 'Test with strings that do/don\'t match the regex pattern' },
  Positive: { category: 'validation', testHint: 'Test with zero and negative values' },
  Future: { category: 'validation', testHint: 'Test with past dates' },
  Past: { category: 'validation', testHint: 'Test with future dates' },

  // JPA
  Entity: { category: 'jpa', testHint: 'Test entity lifecycle, equals/hashCode, validation constraints' },
  Table: { category: 'jpa', testHint: 'Verify table mapping in integration tests' },
  Id: { category: 'jpa', testHint: 'Test ID generation strategy' },
  GeneratedValue: { category: 'jpa', testHint: 'Verify ID is auto-generated on persist' },
  Column: { category: 'jpa', testHint: 'Test column constraints (nullable, unique, length)' },
  OneToMany: { category: 'jpa', testHint: 'Test relationship cascading and orphan removal' },
  ManyToOne: { category: 'jpa', testHint: 'Test foreign key relationship and lazy/eager loading' },
  ManyToMany: { category: 'jpa', testHint: 'Test join table, add/remove from collection' },
  OneToOne: { category: 'jpa', testHint: 'Test bidirectional relationship consistency' },

  // Lombok
  Data: { category: 'lombok', testHint: 'Lombok generates getters/setters/equals/hashCode/toString — test them' },
  Builder: { category: 'lombok', testHint: 'Use builder pattern in test setup for clean object creation' },
  AllArgsConstructor: { category: 'lombok', testHint: 'Use all-args constructor in test setup' },
  NoArgsConstructor: { category: 'lombok', testHint: 'Test default construction' },
  Getter: { category: 'lombok', testHint: 'Getters are generated — use them in assertions' },
  Setter: { category: 'lombok', testHint: 'Setters are generated — use them in test setup' },
  Slf4j: { category: 'lombok', testHint: 'Logger is available, no need to mock it' },
  RequiredArgsConstructor: { category: 'lombok', testHint: 'Constructor injection for final fields — use in test setup' },

  // Security
  PreAuthorize: { category: 'security', testHint: 'Test with @WithMockUser, verify access denied for unauthorized roles' },
  Secured: { category: 'security', testHint: 'Test role-based access with @WithMockUser' },
  RolesAllowed: { category: 'security', testHint: 'Test each role has correct access' },

  // Async & Scheduling
  Async: { category: 'async', testHint: 'Test async execution, verify Future/CompletableFuture result' },
  Scheduled: { category: 'scheduling', testHint: 'Test the scheduled method logic directly, verify side effects' },
  EnableScheduling: { category: 'scheduling', testHint: 'Test scheduler configuration' },
};

export function extractClassName(javaCode) {
  if (!javaCode || typeof javaCode !== 'string') {
    return 'UnknownClass';
  }
  
  const classMatch = javaCode.match(/(?:public\s+)?class\s+(\w+)/);
  return classMatch ? classMatch[1] : 'UnknownClass';
}

export function detectClassType(javaCode) {
  if (!javaCode || typeof javaCode !== 'string') {
    return { type: 'unknown', label: 'Unknown', color: 'gray', description: '' };
  }

  const className = extractClassName(javaCode).toLowerCase();

  if (/@RestController|@Controller/.test(javaCode)) {
    return { type: 'controller', label: 'Controller', color: 'blue', description: 'MockMvc, HTTP status codes, request/response validation' };
  }
  if (/@Service/.test(javaCode)) {
    return { type: 'service', label: 'Service', color: 'green', description: 'Business logic, mocked dependencies, edge cases' };
  }
  if (/@Repository/.test(javaCode) || /extends\s+(Jpa|Crud|Paging)Repository/.test(javaCode)) {
    return { type: 'repository', label: 'Repository', color: 'purple', description: '@DataJpaTest, queries, embedded DB' };
  }
  if (/@Entity|@Table/.test(javaCode)) {
    return { type: 'entity', label: 'Entity', color: 'orange', description: 'equals/hashCode, validation constraints, relationships' };
  }
  if (/@Configuration|@Bean/.test(javaCode)) {
    return { type: 'config', label: 'Config', color: 'yellow', description: 'Bean creation, conditional loading' };
  }
  if (/@Component/.test(javaCode)) {
    return { type: 'component', label: 'Component', color: 'teal', description: 'Mocked dependencies, unit tests' };
  }

  if (/controller$/.test(className)) return { type: 'controller', label: 'Controller', color: 'blue', description: 'MockMvc, HTTP endpoints' };
  if (/service$|serviceimpl$/.test(className)) return { type: 'service', label: 'Service', color: 'green', description: 'Business logic tests' };
  if (/repository$|repo$|dao$/.test(className)) return { type: 'repository', label: 'Repository', color: 'purple', description: 'Data access tests' };
  if (/entity$|model$/.test(className)) return { type: 'entity', label: 'Entity', color: 'orange', description: 'Entity behavior tests' };
  if (/dto$|request$|response$/.test(className)) return { type: 'dto', label: 'DTO', color: 'pink', description: 'Serialization, getters/setters' };
  if (/util$|utils$|helper$/.test(className)) return { type: 'utility', label: 'Utility', color: 'cyan', description: 'Static methods, pure functions' };

  return { type: 'unknown', label: 'Class', color: 'gray', description: 'Standard Java class' };
}
