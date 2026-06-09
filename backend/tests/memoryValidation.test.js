const { memorySchema } = require('../src/validations/fun/memoryValidation');

describe('Memory Schema validation tests', () => {
  it('should pass if all fields are valid and isTimeCapsule is false', () => {
    const validData = {
      title: 'Our first meeting',
      description: 'At the coffee shop',
      date: '2025-11-30',
      isTimeCapsule: false,
      unlockDate: ''
    };
    const result = memorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass if unlockDate is null or undefined when isTimeCapsule is false', () => {
    const validData1 = {
      title: 'Our first meeting',
      description: 'At the coffee shop',
      date: '2025-11-30',
      isTimeCapsule: false,
      unlockDate: null
    };
    const result1 = memorySchema.safeParse(validData1);
    expect(result1.success).toBe(true);

    const validData2 = {
      title: 'Our first meeting',
      description: 'At the coffee shop',
      date: '2025-11-30',
      isTimeCapsule: false
    };
    const result2 = memorySchema.safeParse(validData2);
    expect(result2.success).toBe(true);
  });

  it('should pass if isTimeCapsule is true and unlockDate is a valid date', () => {
    const validData = {
      title: 'A time capsule',
      description: 'Open in the future',
      date: '2025-11-30',
      isTimeCapsule: true,
      unlockDate: '2026-12-31'
    };
    const result = memorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if isTimeCapsule is true but unlockDate is empty, null or undefined', () => {
    const invalidData1 = {
      title: 'A time capsule',
      description: 'Open in the future',
      date: '2025-11-30',
      isTimeCapsule: true,
      unlockDate: ''
    };
    const result1 = memorySchema.safeParse(invalidData1);
    expect(result1.success).toBe(false);

    const invalidData2 = {
      title: 'A time capsule',
      description: 'Open in the future',
      date: '2025-11-30',
      isTimeCapsule: true,
      unlockDate: null
    };
    const result2 = memorySchema.safeParse(invalidData2);
    expect(result2.success).toBe(false);

    const invalidData3 = {
      title: 'A time capsule',
      description: 'Open in the future',
      date: '2025-11-30',
      isTimeCapsule: true
    };
    const result3 = memorySchema.safeParse(invalidData3);
    expect(result3.success).toBe(false);
  });

  it('should fail if date is invalid', () => {
    const invalidData = {
      title: 'Our first meeting',
      description: 'At the coffee shop',
      date: 'invalid-date',
      isTimeCapsule: false
    };
    const result = memorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
