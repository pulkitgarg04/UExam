const checkTestAvailability = (testDate: string, duration: number) => {
  const now = new Date()
  const testTime = new Date(testDate)
  const testEndTime = new Date(testTime.getTime() + duration * 60 * 1000)
  const timeDiff = testTime.getTime() - now.getTime()

  const thirtyMinsBefore = 30 * 60 * 1000

  if (timeDiff > thirtyMinsBefore) {
    return {
      available: false,
      message: `Test will be available ${Math.floor((timeDiff - thirtyMinsBefore) / (1000 * 60))} minutes before start time`,
      timeUntil: timeDiff - thirtyMinsBefore,
    }
  } else if (now > testEndTime) {
    return {
      available: false,
      message: "Test has ended",
      timeUntil: 0,
    }
  } else {
    return {
      available: true,
      message: "Test is available now",
      timeUntil: 0,
    }
  }
}

const InstructionsPage = () => {
  const testDate = "2024-01-01T10:00:00.000Z"
  const duration = 60

  const availability = checkTestAvailability(testDate, duration)

  return (
    <div>
      <h1>Test Instructions</h1>
      <p>Please read the following instructions carefully before starting the test:</p>
      <ul>
        <li>Make sure you have a stable internet connection.</li>
        <li>Do not close the browser window during the test.</li>
        <li>Answer all questions to the best of your ability.</li>
      </ul>

      <h2>Test Availability</h2>
      <p>{availability.message}</p>

      {availability.available && <button>Start Test</button>}
    </div>
  )
}

export default InstructionsPage