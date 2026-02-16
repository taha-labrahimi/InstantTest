// Known testing-related dependencies and their info
const KNOWN_TEST_DEPS = {
  'junit-jupiter': { name: 'JUnit 5', category: 'test-framework', icon: 'test' },
  'junit-jupiter-api': { name: 'JUnit 5 API', category: 'test-framework', icon: 'test' },
  'junit-jupiter-engine': { name: 'JUnit 5 Engine', category: 'test-framework', icon: 'test' },
  'junit-jupiter-params': { name: 'JUnit 5 Params', category: 'test-framework', icon: 'test' },
  'junit': { name: 'JUnit 4', category: 'test-framework', icon: 'test' },
  'mockito-core': { name: 'Mockito', category: 'mocking', icon: 'mock' },
  'mockito-junit-jupiter': { name: 'Mockito JUnit 5', category: 'mocking', icon: 'mock' },
  'mockito-inline': { name: 'Mockito Inline', category: 'mocking', icon: 'mock' },
  'spring-boot-starter-test': { name: 'Spring Boot Test', category: 'spring', icon: 'spring' },
  'spring-test': { name: 'Spring Test', category: 'spring', icon: 'spring' },
  'spring-boot-starter-web': { name: 'Spring Web', category: 'spring', icon: 'spring' },
  'spring-boot-starter-data-jpa': { name: 'Spring Data JPA', category: 'spring', icon: 'spring' },
  'assertj-core': { name: 'AssertJ', category: 'assertion', icon: 'assert' },
  'hamcrest': { name: 'Hamcrest', category: 'assertion', icon: 'assert' },
  'hamcrest-core': { name: 'Hamcrest Core', category: 'assertion', icon: 'assert' },
  'h2': { name: 'H2 Database', category: 'database', icon: 'db' },
  'testcontainers': { name: 'Testcontainers', category: 'database', icon: 'db' },
  'rest-assured': { name: 'REST Assured', category: 'api-test', icon: 'api' },
  'wiremock': { name: 'WireMock', category: 'api-test', icon: 'api' },
  'jackson-databind': { name: 'Jackson', category: 'serialization', icon: 'json' },
  'lombok': { name: 'Lombok', category: 'utility', icon: 'util' },
  'mapstruct': { name: 'MapStruct', category: 'utility', icon: 'util' },
};

export function parsePomXml(pomContent) {
  if (!pomContent || typeof pomContent !== 'string') {
    return { dependencies: [], properties: {}, javaVersion: null };
  }

  // Extract properties (for version variables like ${junit.version})
  const properties = {};
  const propsMatch = pomContent.match(/<properties>([\s\S]*?)<\/properties>/);
  if (propsMatch) {
    const propRegex = /<(\w[\w.-]*)>(.*?)<\/\1>/g;
    let pm;
    while ((pm = propRegex.exec(propsMatch[1])) !== null) {
      properties[pm[1]] = pm[2].trim();
    }
  }

  // Resolve version variables
  const resolveVersion = (version) => {
    if (!version) return null;
    const varMatch = version.match(/\$\{(.+?)\}/);
    if (varMatch) {
      return properties[varMatch[1]] || version;
    }
    return version;
  };

  // Extract Java version
  const javaVersion = properties['java.version'] || properties['maven.compiler.source'] || null;

  // Extract dependencies — order-independent parsing
  const dependencies = [];
  const depBlockRegex = /<dependency>([\s\S]*?)<\/dependency>/g;
  let dm;
  while ((dm = depBlockRegex.exec(pomContent)) !== null) {
    const block = dm[1];
    const groupId = (block.match(/<groupId>(.*?)<\/groupId>/) || [])[1]?.trim() || '';
    const artifactId = (block.match(/<artifactId>(.*?)<\/artifactId>/) || [])[1]?.trim() || '';
    const rawVersion = (block.match(/<version>(.*?)<\/version>/) || [])[1]?.trim() || null;
    const scope = (block.match(/<scope>(.*?)<\/scope>/) || [])[1]?.trim() || 'compile';
    const version = resolveVersion(rawVersion);

    if (!artifactId) continue;

    const known = KNOWN_TEST_DEPS[artifactId];
    dependencies.push({
      groupId,
      artifactId,
      version,
      scope,
      name: known?.name || artifactId,
      category: known?.category || 'other',
      isTestDep: scope === 'test' || !!known,
    });
  }

  return { dependencies, properties, javaVersion };
}

export function analyzeDependencies(parsed, classType) {
  const { dependencies, javaVersion } = parsed;
  const found = {};
  dependencies.forEach(d => { found[d.artifactId] = d; });

  const suggestions = [];
  const detected = {
    testFramework: null,
    mockingLib: null,
    assertionLib: null,
    springBoot: false,
    springWeb: false,
    springJpa: false,
    hasH2: false,
    hasLombok: false,
  };

  // Detect what's present
  if (found['junit-jupiter'] || found['junit-jupiter-api'] || found['spring-boot-starter-test']) {
    detected.testFramework = 'junit5';
  } else if (found['junit']) {
    detected.testFramework = 'junit4';
  }

  if (found['mockito-core'] || found['mockito-junit-jupiter'] || found['spring-boot-starter-test']) {
    detected.mockingLib = 'mockito';
  }

  if (found['assertj-core'] || found['spring-boot-starter-test']) {
    detected.assertionLib = 'assertj';
  } else if (found['hamcrest'] || found['hamcrest-core']) {
    detected.assertionLib = 'hamcrest';
  }

  // Detect Spring Boot from any spring-boot-starter-* dependency
  const hasAnySpringBootStarter = dependencies.some(d => d.artifactId.startsWith('spring-boot-starter'));
  detected.springBoot = hasAnySpringBootStarter || !!found['spring-boot-starter-test'] || !!found['spring-boot-starter-web'];
  detected.springWeb = !!found['spring-boot-starter-web'] || !!found['spring-boot-starter-jetty'];
  detected.springJpa = !!found['spring-boot-starter-data-jpa'];
  detected.hasH2 = !!found['h2'];
  detected.hasLombok = !!found['lombok'];

  // Pick versions compatible with the project's Java version
  const javaVer = parseFloat(javaVersion) || 17;
  const isJava8 = javaVer <= 1.8 || javaVer === 8;
  const junitVer = '5.10.2'; // works on Java 8+
  const mockitoVer = isJava8 ? '4.11.0' : '5.11.0'; // Mockito 5+ requires Java 11
  const assertjVer = isJava8 ? '3.24.2' : '3.25.3'; // AssertJ 3.25+ requires Java 11

  // Suggest missing dependencies
  if (!detected.testFramework) {
    suggestions.push({
      level: 'error',
      message: 'No test framework found',
      suggestion: 'Add junit-jupiter (JUnit 5) to your pom.xml',
      xml: `<dependency>\n  <groupId>org.junit.jupiter</groupId>\n  <artifactId>junit-jupiter</artifactId>\n  <version>${junitVer}</version>\n  <scope>test</scope>\n</dependency>`,
    });
  }

  if (detected.testFramework === 'junit4') {
    suggestions.push({
      level: 'warning',
      message: 'Using JUnit 4 (legacy)',
      suggestion: 'Consider upgrading to JUnit 5 for better features. Tests will be generated with JUnit 4 syntax.',
    });
  }

  if (!detected.mockingLib) {
    suggestions.push({
      level: 'warning',
      message: 'No mocking library found',
      suggestion: `Add Mockito for mocking dependencies${isJava8 ? ' (v4.x for Java 8 compatibility)' : ''}`,
      xml: `<dependency>\n  <groupId>org.mockito</groupId>\n  <artifactId>mockito-junit-jupiter</artifactId>\n  <version>${mockitoVer}</version>\n  <scope>test</scope>\n</dependency>`,
    });
  }

  if (!detected.assertionLib) {
    suggestions.push({
      level: 'info',
      message: 'No assertion library (AssertJ/Hamcrest)',
      suggestion: `AssertJ provides fluent assertions${isJava8 ? ' (v3.24.x for Java 8 compatibility)' : ''}`,
      xml: `<dependency>\n  <groupId>org.assertj</groupId>\n  <artifactId>assertj-core</artifactId>\n  <version>${assertjVer}</version>\n  <scope>test</scope>\n</dependency>`,
    });
  }

  // Class-type specific suggestions
  if (classType === 'controller' && !detected.springWeb) {
    suggestions.push({
      level: 'warning',
      message: 'Controller detected but no Spring Web dependency',
      suggestion: 'MockMvc requires spring-boot-starter-web',
      xml: `<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-web</artifactId>\n</dependency>`,
    });
  }

  if (classType === 'repository' && !detected.hasH2) {
    suggestions.push({
      level: 'info',
      message: 'Repository detected but no H2 database',
      suggestion: 'H2 is useful for @DataJpaTest integration tests',
      xml: `<dependency>\n  <groupId>com.h2database</groupId>\n  <artifactId>h2</artifactId>\n  <scope>test</scope>\n</dependency>`,
    });
  }

  if (detected.springBoot && !found['spring-boot-starter-test']) {
    suggestions.push({
      level: 'error',
      message: 'Spring Boot project without spring-boot-starter-test',
      suggestion: 'This includes JUnit 5, Mockito, AssertJ, MockMvc all in one',
      xml: `<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-test</artifactId>\n  <scope>test</scope>\n</dependency>`,
    });
  }

  return { detected, suggestions, javaVersion };
}
