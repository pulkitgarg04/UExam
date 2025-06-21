import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ testLink: string }> }) {
  try {
    const testLink = (await params).testLink; 
    const mockTest = {
      id: "test-1",
      title: "Data Structures Mid-term Exam",
      subject: "Data Structures & Algorithms",
      testLink, // TODO: fix this up later
      department: "Computer Science & Engineering",
      degree: "B.Tech",
      studentYear: "2nd Year",
      date: "2024-01-25T10:00:00Z",
      duration: 120, // minutes
      totalMarks: 100,
      questions: [
        {
          id: "q1",
          type: "MCQ",
          question: "What is the time complexity of inserting an element at the beginning of an array?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
          marks: 2,
        },
        {
          id: "q2",
          type: "MCQ",
          question: "Which data structure follows LIFO (Last In First Out) principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          marks: 2,
        },
        {
          id: "q3",
          type: "CODING",
          question:
            "Write a function to reverse a linked list.\n\nInput: A singly linked list\nOutput: The reversed linked list\n\nExample:\nInput: 1 -> 2 -> 3 -> 4 -> 5\nOutput: 5 -> 4 -> 3 -> 2 -> 1\n\nConstraints:\n- The number of nodes is in the range [0, 5000]\n- Node values are integers",
          marks: 10,
        },
        {
          id: "q4",
          type: "MCQ",
          question: "What is the space complexity of merge sort?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          marks: 2,
        },
        {
          id: "q5",
          type: "CODING",
          question:
            "Implement a function to check if a binary tree is balanced.\n\nA binary tree is balanced if the height difference between left and right subtrees is at most 1 for every node.\n\nInput: Root of a binary tree\nOutput: Boolean (true if balanced, false otherwise)\n\nExample:\nInput: [3,9,20,null,null,15,7]\nOutput: true\n\nInput: [1,2,2,3,3,null,null,4,4]\nOutput: false",
          marks: 15,
        },
      ],
    }

    return NextResponse.json({ test: mockTest })
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json({ error: "Test not found" }, { status: 404 })
  }
}