export const JUDGE0_LANGUAGES = [
  {
    id: 63,
    name: "JavaScript (Node.js 12.14.0)",
    value: "javascript",
    extension: "js",
    label: "JavaScript",
  },
  {
    id: 71,
    name: "Python (3.8.1)",
    value: "python",
    extension: "py",
    label: "Python 3",
  },
  {
    id: 62,
    name: "Java (OpenJDK 13.0.1)",
    value: "java",
    extension: "java",
    label: "Java",
  },
  {
    id: 54,
    name: "C++ (GCC 9.2.0)",
    value: "cpp",
    extension: "cpp",
    label: "C++",
  },
  {
    id: 50,
    name: "C (GCC 9.2.0)",
    value: "c",
    extension: "c",
    label: "C",
  },
]

export const DEFAULT_CODE_TEMPLATES = {
  javascript: `function solution() {
    // Write your code here
    // Read input using readline or process stdin
    // Example: const input = require('fs').readFileSync(0, 'utf8').trim();
    
    return "Hello World";
}

// Do not modify below this line
console.log(solution());`,

  python: `def solution():
    # Write your code here
    # Read input using input() or sys.stdin
    # Example: data = input().strip()
    
    return "Hello World"

# Do not modify below this line
print(solution())`,

  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Solution sol = new Solution();
        System.out.println(sol.solution(scanner));
        scanner.close();
    }
}

class Solution {
    public String solution(Scanner scanner) {
        // Write your code here
        // Read input using scanner
        // Example: String input = scanner.nextLine();
        
        return "Hello World";
    }
}`,

  cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

string solution() {
    // Write your code here
    // Read input using cin
    // Example: string input; getline(cin, input);
    
    return "Hello World";
}

int main() {
    cout << solution() << endl;
    return 0;
}`,

  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your code here
    // Read input using scanf, fgets, etc.
    // Example: char input[1000]; fgets(input, sizeof(input), stdin);
    
    printf("Hello World\\n");
    return 0;
}`,
}

export function getLanguageById(id: number) {
  return JUDGE0_LANGUAGES.find((lang) => lang.id === id)
}

export function getLanguageByValue(value: string) {
  return JUDGE0_LANGUAGES.find((lang) => lang.value === value)
}

export function getDefaultTemplate(language: string): string {
  return DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES] || DEFAULT_CODE_TEMPLATES.javascript
}