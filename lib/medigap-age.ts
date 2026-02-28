/**
 * Calculate the Medigap quoting age based on CSG specifications.
 *
 * Rules:
 * 1. General Rule: The age is the age the applicant will be at any point during the effective month.
 * 2. The 1st Exception: If the applicant's birthday is on the 1st of the month,
 *    their quoting age is calculated as if their birthday occurred on the 1st of the preceding month.
 *
 * @param birthYear - The birth year (e.g., 1960)
 * @param birthMonth - The birth month (1-12)
 * @param birthDay - The birth day (1-31)
 * @param effectiveYear - The policy effective year
 * @param effectiveMonth - The policy effective month (1-12)
 * @returns The quoting age to use for rate calculations
 */
export function getMedigapRateAge(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  effectiveYear: number,
  effectiveMonth: number,
): number {
  let adjustedBirthYear = birthYear
  let adjustedBirthMonth = birthMonth

  if (birthDay === 1) {
    // Treat as if birthday occurred on the 1st of the preceding month
    adjustedBirthMonth = birthMonth - 1
    if (adjustedBirthMonth === 0) {
      adjustedBirthMonth = 12
      adjustedBirthYear = birthYear - 1
    }
  }

  let age = effectiveYear - adjustedBirthYear

  if (effectiveMonth < adjustedBirthMonth) {
    age = age - 1
  } else if (effectiveMonth >= adjustedBirthMonth) {
    // For Medicare pricing, use the age they will be during the effective month
    // This means if they turn 65 in May and effective date is May, we use age 65
    // Age is already correct from the base calculation
  }

  return age
}

/**
 * Calculate the Medigap start date based on birth date.
 * Medicare usually starts on the first of the 65th birthday month.
 * Exception: If born on the 1st, coverage starts a month earlier.
 *
 * Added logic for people already 65+: returns first of next month
 *
 * @param birthYear - The birth year
 * @param birthMonth - The birth month (1-12)
 * @param birthDay - The birth day (1-31)
 * @returns The recommended start date as { year, month }
 */
export function getMedigapStartDate(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
): { year: number; month: number } {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // JavaScript months are 0-indexed

  // Calculate "First of Next Month" - this is the absolute minimum start date
  let minNextMonth = currentMonth + 1
  let minNextYear = currentYear

  if (minNextMonth > 12) {
    minNextMonth = 1
    minNextYear = currentYear + 1
  }

  // Calculate current age
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
  const age = currentYear - birthYear - (today < new Date(currentYear, birthMonth - 1, birthDay) ? 1 : 0)

  // If already 65 or older, return first of next month
  if (age >= 65) {
    return { year: minNextYear, month: minNextMonth }
  }

  // For people not yet 65, calculate when they turn 65 (Candidate Start Date)
  let startYear = birthYear + 65
  let startMonth = birthMonth

  // Exception: If born on the 1st, coverage starts a month earlier
  if (birthDay === 1) {
    startMonth = startMonth - 1
    if (startMonth === 0) {
      startMonth = 12
      startYear = startYear - 1
    }
  }

  // Compare Candidate Date vs Minimum Date (Next Month)
  // If Candidate Date is before Minimum Date, use Minimum Date
  if (startYear < minNextYear || (startYear === minNextYear && startMonth < minNextMonth)) {
    return { year: minNextYear, month: minNextMonth }
  }

  return { year: startYear, month: startMonth }
}
