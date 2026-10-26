/* Lesson metadata transcribed from the project PDF; source slides and app-authored notes stay distinct. */
export const PYTHON_LESSONS = [
  {
    "number": 1,
    "level": "Basic Python",
    "title": "Introduction to Python Programming",
    "learnerOutcome": "Explain what Python is, identify uses, and execute a first program.",
    "prerequisite": "Course orientation / no previous coding required",
    "discussion": [
      "What a programming language and program are",
      "Python as a general-purpose interpreted language and what an interpreter does",
      "Everyday applications: automation, web services, data analysis, AI",
      "Source code versus program output",
      "Sequence of instructions and basic debugging mindset",
      "How lessons, editor, Run, output, and feedback work"
    ],
    "workedCode": "print(\"Hello, Python!\")\nprint(\"I can write instructions for a computer.\")",
    "expectedBehavior": "Two print calls run in order and display two lines. Distinguish typing code from running it.",
    "guidedPractice": "Edit the greeting and add a third print statement about a real-world use of Python.",
    "applyChallenge": "Create a three-line introduction program and correctly predict the output before running.",
    "knowledgeChecks": [
      {
        "question": "What is a Python program?",
        "answer": "A sequence of instructions written in Python"
      },
      {
        "question": "What does print() do?",
        "answer": "Displays values in standard output"
      },
      {
        "question": "Name one use of Python.",
        "answer": "Automation, websites, data, AI, or another valid use"
      }
    ],
    "pageUiNeed": "Welcome example, Run button, output pane, and a short “predict then run” check.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Edit the greeting print statements and Run; show the two real lines from stdout; Check verifies a third printed line.",
    "accuracyNote": "",
    "sourceSummary": "Python is a readable, general-purpose language used for software, automation, websites, data, and artificial intelligence.",
    "authoredExplanation": "A Python program is a sequence of instructions. The interpreter reads those instructions and performs them in order. Start by naming the task, writing the smallest steps, and checking the result.",
    "referenceOutput": "Hello, Python!\nI can write instructions for a computer.",
    "commonMistake": "Do not confuse the source code you type with the output produced after the interpreter runs it."
  },
  {
    "number": 2,
    "level": "Basic Python",
    "title": "Python Installation",
    "learnerOutcome": "Set up or identify a working Python environment and verify it.",
    "prerequisite": "Lesson 01 familiarity",
    "discussion": [
      "Local Python installation from python.org and compatible operating systems",
      "Difference between interpreter, terminal, editor, and IDE",
      "Version verification with python --version or python3 --version",
      "Create and save a .py file, then run it",
      "PATH and interpreter selection troubleshooting",
      "Browser playground alternative that requires no local installation"
    ],
    "workedCode": "# save as hello.py and run with python hello.py\nprint(\"Python environment ready\")",
    "expectedBehavior": "The in-page code panel demonstrates the saved script; terminal commands belong in instructions, not Python editor.",
    "guidedPractice": "Follow an OS-specific checklist to verify Python and run hello.py locally, or use the built-in browser runner.",
    "applyChallenge": "Submit a short setup report: environment type, verification result, and one issue resolved (or “none”).",
    "knowledgeChecks": [
      {
        "question": "Does a browser-hosted Python runner require local installation?",
        "answer": "No"
      },
      {
        "question": "What file extension is standard for a Python script?",
        "answer": ".py"
      },
      {
        "question": "What checks the installed Python version?",
        "answer": "python --version or python3 --version"
      }
    ],
    "pageUiNeed": "OS tabs (Windows/macOS/Linux), copyable shell commands, verification checklist, and local/browser mode distinction.",
    "runtimeMode": "setup-checklist",
    "handsOnInteraction": "Show OS-specific installation steps and genuine terminal commands as copyable text. A real browser Hello World demo may be embedded, but never pretend to run python --version in the Python editor.",
    "accuracyNote": "No version number should be hardcoded as “latest.” Never put shell commands directly into executable Python examples.",
    "sourceSummary": "Install Python and choose an editor or IDE. Verify the setup by running a simple program.",
    "authoredExplanation": "The Python interpreter runs source files. An editor helps you write them, but the two tools are separate. Check that your terminal can find the interpreter before troubleshooting an editor.",
    "referenceOutput": "Python environment ready",
    "commonMistake": "Do not type terminal commands such as python --version into a Python source file."
  },
  {
    "number": 3,
    "level": "Basic Python",
    "title": "Python Syntax",
    "learnerOutcome": "Recognize indentation, comments, statements, and basic syntax errors.",
    "prerequisite": "Lessons 01–02 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Python statements and reading code top to bottom",
      "Indentation defines code blocks rather than braces",
      "Colon introduces suites after if, for, def, and similar statements",
      "Single-line comments with # and meaningful code formatting",
      "Case sensitivity and identifier spelling",
      "SyntaxError versus IndentationError and error location"
    ],
    "workedCode": "score = 8\nif score >= 5:\n    print(\"Pass\")\n# This comment documents the decision.",
    "expectedBehavior": "The print line must be indented under the condition. Explain why a misplaced space can change execution.",
    "guidedPractice": "Fix a version of the code with missing colon and incorrect indentation.",
    "applyChallenge": "Given four small snippets, identify which run and repair the broken ones.",
    "knowledgeChecks": [
      {
        "question": "Why is indentation important?",
        "answer": "It groups statements into blocks"
      },
      {
        "question": "Does Score refer to score?",
        "answer": "No, identifiers are case-sensitive"
      },
      {
        "question": "What begins a one-line comment?",
        "answer": "#"
      }
    ],
    "pageUiNeed": "Error highlighter with a corrected-code reveal and a visual indentation guide.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Present intentionally broken indentation/colon code; learner repairs and runs it; show actual SyntaxError or successful output.",
    "accuracyNote": "",
    "sourceSummary": "Python syntax includes valid statements, indentation, comments, and code structure. Learners practice correcting syntax errors.",
    "authoredExplanation": "Python uses indentation to show which statements belong together. A colon starts an indented block. Comments begin with # and are ignored by the interpreter.",
    "referenceOutput": "Pass",
    "commonMistake": "A missing colon or inconsistent indentation can prevent a block from running; Python is also case-sensitive."
  },
  {
    "number": 4,
    "level": "Basic Python",
    "title": "Variables & Constants",
    "learnerOutcome": "Assign values, update variables, and use conventional constant names.",
    "prerequisite": "Lessons 01–03 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Assignment with = versus equality comparison with ==",
      "Names, snake_case, and case sensitivity",
      "Reassignment and how variables refer to objects",
      "Simple arithmetic using named values",
      "Uppercase names as conventional constants (not enforced immutability)",
      "Avoiding reserved keywords and misleading names"
    ],
    "workedCode": "price = 120\nquantity = 2\nTOTAL_TAX_RATE = 0.12\nsubtotal = price * quantity\nprint(subtotal)\nprint(subtotal * TOTAL_TAX_RATE)",
    "expectedBehavior": "Explain the order of assignment, the resulting subtotal (240), and the tax amount (28.8).",
    "guidedPractice": "Change price and quantity, then predict the two printed values.",
    "applyChallenge": "Model a small order with unit_price, quantity, discount_rate, and total_cost.",
    "knowledgeChecks": [
      {
        "question": "Does = compare two values?",
        "answer": "No, it assigns a value"
      },
      {
        "question": "Are uppercase Python names immutable?",
        "answer": "No, uppercase is a convention"
      },
      {
        "question": "What does snake_case look like?",
        "answer": "unit_price"
      }
    ],
    "pageUiNeed": "Variable-value trace table that updates after learner changes source code.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes price and quantity in the embedded variables example; Run displays recalculated subtotal and tax; Check uses a stated target.",
    "accuracyNote": "",
    "sourceSummary": "Variables name values that can change; uppercase names are commonly used by convention for constants.",
    "authoredExplanation": "Assignment binds a name to an object. Names should describe their purpose and use lowercase words separated by underscores. Python does not enforce constants, but uppercase names communicate intent.",
    "referenceOutput": "240\n28.799999999999997",
    "referenceOutputNote": "Python binary floating-point may display the tax product as 28.799999999999997. Use round() or an f-string when presenting currency.",
    "commonMistake": "A single equals sign assigns a value; it does not compare values. Uppercase names are a convention, not enforced constants."
  },
  {
    "number": 5,
    "level": "Basic Python",
    "title": "Data Types",
    "learnerOutcome": "Recognize basic built-in types and convert values appropriately.",
    "prerequisite": "Lessons 01–04 as appropriate; directly builds on the previous topic",
    "discussion": [
      "int, float, str, and bool with examples",
      "type() and why string digits are not integers",
      "Converting with int(), float(), str(), and bool()",
      "Arithmetic behavior with integers and floats",
      "None as absence of a value",
      "Errors from invalid conversions, such as int(\"hello\")"
    ],
    "workedCode": "age_text = \"20\"\nage = int(age_text)\nheight = 1.72\nis_student = True\nprint(age + 1)\nprint(type(height).__name__)\nprint(is_student)",
    "expectedBehavior": "Output is 21, float, True on separate lines. Emphasize type() and conversion.",
    "guidedPractice": "Convert a price string to float and add 5; show the result and its type.",
    "applyChallenge": "Create a user profile with string, integer, float, Boolean, and None values and label each type.",
    "knowledgeChecks": [
      {
        "question": "What type is \"42\"?",
        "answer": "str"
      },
      {
        "question": "What does int(\"42\") produce?",
        "answer": "Integer 42"
      },
      {
        "question": "Can int(\"abc\") succeed?",
        "answer": "No, it raises ValueError"
      }
    ],
    "pageUiNeed": "Type cards, conversion examples, and an inspect-the-value exercise.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner modifies string-to-int/float conversion; Run shows values and type(); a deliberate invalid conversion displays the real exception.",
    "accuracyNote": "",
    "sourceSummary": "Common data types include integers, decimals, strings, and Boolean values. Values can be converted when appropriate.",
    "authoredExplanation": "A type determines which operations make sense for a value. Input from input() is text, so convert numeric text before doing arithmetic. Conversion can fail when text is not a valid number.",
    "referenceOutput": "21\nfloat\nTrue",
    "commonMistake": "Text that looks numeric is still a string until it is converted; invalid conversions raise an exception."
  },
  {
    "number": 6,
    "level": "Basic Python",
    "title": "Operators & Expressions",
    "learnerOutcome": "Use arithmetic, comparison, and Boolean operators with correct precedence.",
    "prerequisite": "Lessons 01–05 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Arithmetic +, -, *, /, //, %, **",
      "Comparison ==, !=, <, <=, >, >=",
      "Boolean and, or, not",
      "Operator precedence and parentheses",
      "The difference between / and //",
      "Realistic expressions such as eligibility checks"
    ],
    "workedCode": "a = 7\nb = 3\nprint(a / b)\nprint(a // b)\nprint(a % b)\nprint((a > 5) and (b < 5))",
    "expectedBehavior": "Contrast true division, floor division, remainder, and a Boolean expression.",
    "guidedPractice": "Predict values for 2 + 3 * 4 and (2 + 3) * 4, then run.",
    "applyChallenge": "Compute a shopping total and determine whether it qualifies for free delivery.",
    "knowledgeChecks": [
      {
        "question": "What does % return?",
        "answer": "Remainder"
      },
      {
        "question": "What is 2 + 3 * 4?",
        "answer": "14"
      },
      {
        "question": "What is the result of 7 // 3?",
        "answer": "2"
      }
    ],
    "pageUiNeed": "Operator reference matrix and live expression evaluator powered by the actual runner.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner edits arithmetic and Boolean expressions; Run displays live results; Check tests integer floor-division and precedence.",
    "accuracyNote": "",
    "sourceSummary": "Operators perform arithmetic and logical comparisons. Operator precedence controls the order of evaluation.",
    "authoredExplanation": "Parentheses make the intended order clear. Comparisons produce Boolean values, which can be combined with and, or, and not. Use // for floor division and % for the remainder.",
    "referenceOutput": "2.3333333333333335\n2\n1\nTrue",
    "commonMistake": "True division (/) and floor division (//) are different, and operator precedence can change an expression result."
  },
  {
    "number": 7,
    "level": "Basic Python",
    "title": "Input & Output",
    "learnerOutcome": "Read textual input, convert it safely, and format output.",
    "prerequisite": "Lessons 01–06 as appropriate; directly builds on the previous topic",
    "discussion": [
      "print() output and separation between print and input",
      "input(prompt) always returns a string",
      "Converting numeric input with int()/float()",
      "f-strings for readable output",
      "Handling blank/invalid input at a beginner level",
      "Difference between interactive terminal input and programmatic test input"
    ],
    "workedCode": "name = input(\"Name: \")\nage = int(input(\"Age: \"))\nprint(f\"Hello, {name}. Next year: {age + 1}\")",
    "expectedBehavior": "For sample inputs Ana and 20, output ends with “Hello, Ana. Next year: 21”.",
    "guidedPractice": "Use the input panel to provide a name and age; try a non-number age to inspect the error.",
    "applyChallenge": "Build a rectangle area calculator with width and height input and formatted output.",
    "knowledgeChecks": [
      {
        "question": "What type does input() return?",
        "answer": "str"
      },
      {
        "question": "Why convert an age input?",
        "answer": "For numeric arithmetic"
      },
      {
        "question": "What does an f-string do?",
        "answer": "Inserts expressions into formatted text"
      }
    ],
    "pageUiNeed": "Stdin input panel, example inputs, output preview, and an invalid-input hint.",
    "runtimeMode": "python-input",
    "handsOnInteraction": "Provide editable code AND sample stdin name/age fields; Run displays the greeting or a real conversion error; learner changes inputs.",
    "accuracyNote": "The runner needs stdin support or an explicit documented limitation and alternate guided mock.",
    "sourceSummary": "Programs receive information with input(), display results with print(), and can format strings.",
    "authoredExplanation": "input() always returns a string. Convert it before arithmetic, and give users a clear prompt. An f-string inserts expressions inside braces.",
    "referenceOutput": "Hello, Ana. Next year: 21",
    "sampleInput": "Ana\n20",
    "commonMistake": "input() returns text. Convert and validate numeric input before using it in arithmetic."
  },
  {
    "number": 8,
    "level": "Basic Python",
    "title": "Conditional Statements",
    "learnerOutcome": "Implement decisions with if, elif, else, and Boolean logic.",
    "prerequisite": "Lessons 01–07 as appropriate; directly builds on the previous topic",
    "discussion": [
      "True/False conditions and indentation",
      "if, elif, and else control flow",
      "Comparison operators in branch conditions",
      "and/or/not for combined conditions",
      "Boundary cases and ordering of conditions",
      "Nested conditions only after simple branches are clear"
    ],
    "workedCode": "score = 78\nif score >= 90:\n    print(\"Excellent\")\nelif score >= 75:\n    print(\"Passed\")\nelse:\n    print(\"Keep practicing\")",
    "expectedBehavior": "Score 78 prints Passed; discuss what changes at exactly 75 and 90.",
    "guidedPractice": "Test scores 74, 75, 89, 90 and record selected branches.",
    "applyChallenge": "Build a fare-discount decision program with age and membership conditions.",
    "knowledgeChecks": [
      {
        "question": "What does elif mean?",
        "answer": "Else if"
      },
      {
        "question": "Which branch runs for score 78 here?",
        "answer": "Passed"
      },
      {
        "question": "Can multiple branches of one if/elif/else chain run?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Branch-flow diagram that highlights the evaluated and selected path.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes score to choose all three branches; Run displays actual branch; Check asks for an Excellent result without modifying printed text.",
    "accuracyNote": "",
    "sourceSummary": "if, elif, and else choose actions. Conditions can use comparisons and Boolean logic.",
    "authoredExplanation": "Python checks conditions from top to bottom and runs the first matching branch. Put the most specific or highest-priority cases first, and keep each branch focused.",
    "referenceOutput": "Passed",
    "commonMistake": "Check boundary values and order branches from the most specific condition to the broadest."
  },
  {
    "number": 9,
    "level": "Basic Python",
    "title": "Loops & Iteration",
    "learnerOutcome": "Repeat work with for/while and control iteration safely.",
    "prerequisite": "Lessons 01–08 as appropriate; directly builds on the previous topic",
    "discussion": [
      "When repetition is useful",
      "for with range() and iterables",
      "while loops with a stopping condition",
      "break versus continue",
      "Off-by-one errors and range end exclusivity",
      "Infinite-loop prevention and iteration limits"
    ],
    "workedCode": "for number in range(1, 6):\n    if number == 3:\n        continue\n    print(number)",
    "expectedBehavior": "Prints 1, 2, 4, 5; 3 is skipped. Explain range(1, 6).",
    "guidedPractice": "Create a while countdown from 5 to 1 and ensure it terminates.",
    "applyChallenge": "Build a multiplication table for a given integer using a loop.",
    "knowledgeChecks": [
      {
        "question": "Does range(1, 6) include 6?",
        "answer": "No"
      },
      {
        "question": "What does break do?",
        "answer": "Exits the nearest loop"
      },
      {
        "question": "What does continue do?",
        "answer": "Skips to the next loop iteration"
      }
    ],
    "pageUiNeed": "Loop iteration visualizer, step-through table, and safe execution timeout.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes range limits and continue/break; Run shows resulting numbers; server/browser runtime stops infinite loops with a timeout.",
    "accuracyNote": "",
    "sourceSummary": "for and while repeat work. range(), break, and continue help control loops.",
    "authoredExplanation": "Use for when iterating over a sequence or a known range. Use while when repetition depends on a condition, and make sure that condition can eventually become false.",
    "referenceOutput": "1\n2\n4\n5",
    "commonMistake": "range() excludes its stop value. A while loop also needs a condition that eventually becomes false."
  },
  {
    "number": 10,
    "level": "Basic Python",
    "title": "Functions",
    "learnerOutcome": "Define reusable functions with parameters, return values, and scope.",
    "prerequisite": "Lessons 01–09 as appropriate; directly builds on the previous topic",
    "discussion": [
      "def syntax and function calls",
      "Parameters versus arguments",
      "return versus print",
      "Default arguments in simple cases",
      "Local versus global names; avoid unnecessary global state",
      "Docstrings and naming readable functions"
    ],
    "workedCode": "def rectangle_area(width, height):\n    return width * height\nresult = rectangle_area(4, 3)\nprint(result)",
    "expectedBehavior": "Describe input 4 and 3, return 12, then separate printing from returning.",
    "guidedPractice": "Turn an existing arithmetic expression into a function that accepts parameters.",
    "applyChallenge": "Create calculate_total(price, quantity, tax_rate=0.0) with at least three tests.",
    "knowledgeChecks": [
      {
        "question": "What keyword defines a function?",
        "answer": "def"
      },
      {
        "question": "What does return do?",
        "answer": "Sends a value to the caller"
      },
      {
        "question": "Is a local variable automatically global?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Function call visualizer, parameter/argument labels, and test cases.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner edits function arguments and return expression; Run shows area; Check validates multiple rectangle dimensions.",
    "accuracyNote": "",
    "sourceSummary": "Functions package reusable instructions. They may accept parameters and return results; names and variables have scope.",
    "authoredExplanation": "A function should have one clear job. Parameters are local names provided by the caller. return sends a result back; print only displays it. Prefer explicit inputs and outputs over hidden global state.",
    "referenceOutput": "12",
    "commonMistake": "print() displays a value; return sends a value back to the caller. They are not interchangeable."
  },
  {
    "number": 11,
    "level": "Basic Python",
    "title": "Strings & Text Processing",
    "learnerOutcome": "Access, slice, normalize, and format text.",
    "prerequisite": "Lessons 01–10 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Immutable string objects and indexing",
      "Zero-based indexing and negative indexes",
      "Slicing start:stop:step",
      "len(), strip(), lower(), upper(), replace(), split(), join()",
      "Searching with in and find()",
      "Unicode text and case comparison caveats"
    ],
    "workedCode": "message = \" Python Basics \"\nclean = message.strip().lower()\nprint(clean)\nprint(clean[:6])\nprint(\"python\" in clean)",
    "expectedBehavior": "Prints python basics, python, True. Show indices and slice stop exclusion.",
    "guidedPractice": "Normalize an entered name using strip() and title() and compare inputs.",
    "applyChallenge": "Build a simple text analyzer reporting word count and whether a word appears.",
    "knowledgeChecks": [
      {
        "question": "Can s[0] access the first character?",
        "answer": "Yes"
      },
      {
        "question": "Does slicing include its stop index?",
        "answer": "No"
      },
      {
        "question": "Do string methods usually alter the original string object?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Clickable string index strip with selected slice preview.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes text and slice positions; Run shows cleaned string, slice and membership result; explain indexing visually.",
    "accuracyNote": "",
    "sourceSummary": "Strings hold text. Methods support searching, formatting, and modification; slicing selects part of a string.",
    "authoredExplanation": "Strings are immutable: methods return a new string instead of changing the original. Indexes start at zero, and a slice excludes its ending index. strip() is useful for cleaning user input.",
    "referenceOutput": "python basics\npython\nTrue",
    "commonMistake": "A slice excludes its stop index, and string methods return new strings rather than changing the original."
  },
  {
    "number": 12,
    "level": "Basic Python",
    "title": "Lists",
    "learnerOutcome": "Create, inspect, change, and iterate through ordered mutable collections.",
    "prerequisite": "Lessons 01–11 as appropriate; directly builds on the previous topic",
    "discussion": [
      "List literals and zero-based indexing",
      "append(), insert(), remove(), pop()",
      "Slicing, membership, and len()",
      "for loops over elements versus indices",
      "Mutability and shallow copies versus aliases",
      "Sorting with sorted() versus list.sort()"
    ],
    "workedCode": "fruits = [\"mango\", \"banana\"]\nfruits.append(\"apple\")\nfruits[0] = \"papaya\"\nprint(fruits)\nprint(len(fruits))",
    "expectedBehavior": "Outputs a three-item list and length 3. Show each mutation step.",
    "guidedPractice": "Add, replace, and remove shopping list items and show the resulting list.",
    "applyChallenge": "Implement a grade tracker that calculates average and identifies the highest grade.",
    "knowledgeChecks": [
      {
        "question": "Are lists mutable?",
        "answer": "Yes"
      },
      {
        "question": "What does append() do?",
        "answer": "Adds one item to the end"
      },
      {
        "question": "What is the index of the first list item?",
        "answer": "0"
      }
    ],
    "pageUiNeed": "List state timeline and index labels that follow code execution.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner appends/removes/replaces list items; Run shows before/after list and length; Check a targeted target-list state.",
    "accuracyNote": "",
    "sourceSummary": "Lists store ordered values that can be changed. Learners practice indexing, slicing, and adding or removing items.",
    "authoredExplanation": "A list keeps items in order and can contain different values, though related values are often easier to process. append adds one item, pop removes and returns one, and slices create a selected sequence.",
    "referenceOutput": "['papaya', 'banana', 'apple']\n3",
    "commonMistake": "Two names can refer to the same mutable list. Do not assume a second name is an independent copy."
  },
  {
    "number": 13,
    "level": "Basic Python",
    "title": "Tuples & Sets",
    "learnerOutcome": "Choose appropriate collection types and apply set operations.",
    "prerequisite": "Lessons 01–12 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Tuple syntax and immutability of item positions",
      "Tuple packing/unpacking",
      "Sets: unique elements and no index-based access",
      "Union",
      ", intersection &, difference -",
      "Membership tests and deduplication",
      "How tuples, lists, and sets differ"
    ],
    "workedCode": "coordinates = (14.6, 121.0)\ntags = {\"python\", \"data\", \"python\"}\nother = {\"data\", \"web\"}\nprint(coordinates[0])\nprint(len(tags))\nprint(tags & other)",
    "expectedBehavior": "The unique set has two elements; intersection contains data. Note set display order is not guaranteed.",
    "guidedPractice": "Deduplicate a list of category names by converting it to a set.",
    "applyChallenge": "Compare common skills between two teams with union and intersection.",
    "knowledgeChecks": [
      {
        "question": "Can a tuple element be reassigned?",
        "answer": "No"
      },
      {
        "question": "Does a set keep duplicates?",
        "answer": "No"
      },
      {
        "question": "Can a set be accessed by numeric index?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Set Venn diagram and collection comparison grid.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner edits two sets and prints union/intersection; Check membership mathematically, never require arbitrary set display order.",
    "accuracyNote": "Do not assert deterministic ordering of printed sets.",
    "sourceSummary": "Tuples are ordered collections whose elements cannot be reassigned. Sets contain unique values and support union and intersection.",
    "authoredExplanation": "Use a tuple for a small fixed group of related values, such as coordinates. Use a set when uniqueness or membership checks matter. Sets have no positional order to rely on.",
    "referenceOutput": "14.6\n2\n{'data'}",
    "referenceOutputNote": "Set display order is not guaranteed; this intersection contains only the value data.",
    "commonMistake": "Sets remove duplicates and do not guarantee a display order; compare membership and contents, not textual ordering."
  },
  {
    "number": 14,
    "level": "Basic Python",
    "title": "Dictionaries",
    "learnerOutcome": "Store, retrieve, and update values by key.",
    "prerequisite": "Lessons 01–13 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Keys and values with dictionary literal syntax",
      "Index access versus get() with default",
      "Add/update/delete entries",
      "Iterating keys, values, and items",
      "Key uniqueness and hashability",
      "A dictionary as a record or configuration"
    ],
    "workedCode": "student = {\"name\": \"Ana\", \"grade\": 88}\nstudent[\"grade\"] = 91\nstudent[\"section\"] = \"A\"\nprint(student[\"name\"])\nprint(student.get(\"grade\"))",
    "expectedBehavior": "Prints Ana and 91. Show how key-based lookup differs from list indexing.",
    "guidedPractice": "Add an email and update the grade; show default handling for a missing key.",
    "applyChallenge": "Build a small inventory dictionary mapping item names to stock quantities.",
    "knowledgeChecks": [
      {
        "question": "What does a dictionary key do?",
        "answer": "Identifies an associated value"
      },
      {
        "question": "What does get() help avoid when a key is absent?",
        "answer": "KeyError"
      },
      {
        "question": "Can a dictionary contain the same key twice as separate entries?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Key-value inspector and editable record table.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner edits keys/values and uses get(); Run shows record data; Check verifies a newly added key and updated grade.",
    "accuracyNote": "",
    "sourceSummary": "Dictionaries store key-value pairs. Keys locate values; records can be created, updated, and retrieved.",
    "authoredExplanation": "A dictionary is useful when values have named roles. Keys must be unique and hashable. get() can provide a fallback for an optional key without raising KeyError.",
    "referenceOutput": "Ana\n91",
    "commonMistake": "Dictionary keys are unique. Use get() when a key may be absent instead of assuming it exists."
  },
  {
    "number": 15,
    "level": "Basic Python",
    "title": "Nested Data Structures",
    "learnerOutcome": "Read and transform lists and dictionaries containing other collections.",
    "prerequisite": "Lessons 01–14 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Lists of dictionaries and dictionaries of lists",
      "Multi-step indexing such as students[0][\"grades\"]",
      "Traversing nested items with loops",
      "Basic comprehensions for transforming data",
      "Avoiding missing-key and out-of-range errors",
      "Choosing a clear record schema for application data"
    ],
    "workedCode": "students = [\n    {\"name\": \"Ana\", \"grades\": [90, 95]},\n    {\"name\": \"Ben\", \"grades\": [80, 85]}\n]\nfor student in students:\n    avg = sum(student[\"grades\"]) / len(student[\"grades\"])\n    print(student[\"name\"], avg)",
    "expectedBehavior": "Show how to locate each nested grades list and compute per-student averages.",
    "guidedPractice": "Add a third student and read only the second student’s first grade.",
    "applyChallenge": "Create a product catalog list of dictionaries, then filter in-stock items.",
    "knowledgeChecks": [
      {
        "question": "What is a nested structure?",
        "answer": "A collection inside another"
      },
      {
        "question": "How do you read Ana’s first grade?",
        "answer": "students[0][\"grades\"][0]"
      },
      {
        "question": "Why use loops with nested data?",
        "answer": "To process multiple records consistently"
      }
    ],
    "pageUiNeed": "Expandable tree viewer, highlighted access paths, and a basic table representation.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes nested student grades and reruns averaging loop; Check validates computed output and avoids zero-length input.",
    "accuracyNote": "",
    "sourceSummary": "Collections can contain other collections to represent records with multiple values. Learners access nested values and use comprehensions to transform data.",
    "authoredExplanation": "A list of dictionaries is a common way to represent rows of records. Read one level at a time, and use a comprehension when a simple transformation is clearer than a manual loop.",
    "referenceOutput": "Ana 92.5\nBen 82.5",
    "commonMistake": "Nested lookups can fail when a key or index is missing, and an empty list cannot be averaged by dividing by its length."
  },
  {
    "number": 16,
    "level": "Intermediate Python",
    "title": "Modules & Packages",
    "learnerOutcome": "Import reusable code and explain the relationship between modules and packages.",
    "prerequisite": "Lessons 01–15 as appropriate; directly builds on the previous topic",
    "discussion": [
      "A module as a .py file and a package as a module namespace",
      "import and from ... import",
      "Standard-library examples: math, random, statistics",
      "Module attributes and qualified names",
      "Create a reusable local helper module",
      "Avoid shadowing standard module names"
    ],
    "workedCode": "import math\nfrom statistics import mean\nprint(math.sqrt(81))\nprint(mean([10, 20, 30]))",
    "expectedBehavior": "Prints 9.0 and 20; contrast imported module prefix with direct imported function.",
    "guidedPractice": "Use random.randint() to simulate a die and document the nondeterministic result.",
    "applyChallenge": "Split a calculator into main.py and helpers.py; import one helper.",
    "knowledgeChecks": [
      {
        "question": "What is a module?",
        "answer": "A Python file of reusable definitions"
      },
      {
        "question": "Why use import?",
        "answer": "To use names defined in another module"
      },
      {
        "question": "What is a standard library?",
        "answer": "Modules included with Python"
      }
    ],
    "pageUiNeed": "File-tree tabs showing main.py and helpers.py, plus a module import diagram.",
    "runtimeMode": "multifile",
    "handsOnInteraction": "Show main.py and helpers.py tabs to type/import real helper code if file- based runtime exists; otherwise safely run math/statistics example and label multifile task unavailable.",
    "accuracyNote": "Multifile editing must be available or lesson demonstrates structure with read-only file mockups.",
    "sourceSummary": "Modules organize reusable code in separate files; packages group related modules. Learners import standard-library tools and organize programs.",
    "authoredExplanation": "A module is a Python file. Import only the names you need, and keep reusable code separate from the script that starts the program. A package groups modules under a directory.",
    "referenceOutput": "9.0\n20",
    "commonMistake": "Avoid naming local files after standard-library modules such as math or statistics, which can shadow imports."
  },
  {
    "number": 17,
    "level": "Intermediate Python",
    "title": "File Handling",
    "learnerOutcome": "Read and write UTF-8 text files safely.",
    "prerequisite": "Lessons 01–16 as appropriate; directly builds on the previous topic",
    "discussion": [
      "File paths and text modes r, w, a",
      "with open(...) and automatic closure",
      "read(), readline(), and looping over lines",
      "Encoding=\"utf-8\" and newline handling",
      "FileNotFoundError and safe path selection",
      "Avoiding accidental overwrite of existing files"
    ],
    "workedCode": "from pathlib import Path\npath = Path(\"notes.txt\")\npath.write_text(\"Python practice\\n\", encoding=\"utf-8\")\nprint(path.read_text(encoding=\"utf-8\").strip())",
    "expectedBehavior": "Writes then reads a simple local text file. Only run in an isolated writable sandbox.",
    "guidedPractice": "Append a second line to a temporary practice file and read both lines.",
    "applyChallenge": "Build a text-based reading log supporting add and list operations.",
    "knowledgeChecks": [
      {
        "question": "What mode may overwrite a file?",
        "answer": "w"
      },
      {
        "question": "Why use with open(...)?",
        "answer": "To close the file automatically"
      },
      {
        "question": "What error occurs for a missing file read?",
        "answer": "FileNotFoundError"
      }
    ],
    "pageUiNeed": "Virtual filesystem file browser, content preview, reset button, and non-destructive sandbox storage.",
    "runtimeMode": "virtual-file",
    "handsOnInteraction": "Show notes.txt in virtual file navigator; learner writes, appends, reads and sees changed file plus stdout; reset wipes only sandbox files.",
    "accuracyNote": "Do not expose access to the app host filesystem.",
    "sourceSummary": "Programs can read and save information. Use open() and with to process files and close them safely.",
    "authoredExplanation": "The with statement closes a file even if an error occurs. Choose an encoding for text files. Modes such as 'r', 'w', and 'a' have different effects; 'w' replaces existing content.",
    "referenceOutput": "Python practice",
    "commonMistake": "Write mode can overwrite an existing file. Keep practice files isolated and choose an explicit text encoding."
  },
  {
    "number": 18,
    "level": "Intermediate Python",
    "title": "Exception Handling",
    "learnerOutcome": "Catch expected exceptions, explain errors, and use finally/else appropriately.",
    "prerequisite": "Lessons 01–17 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Exceptions versus syntax errors",
      "Reading tracebacks and error types",
      "try / except with specific exception classes",
      "else and finally roles",
      "Raising ValueError for invalid program input",
      "Why bare except and silent swallowing are problematic"
    ],
    "workedCode": "try:\n    age = int(\"twenty\")\nexcept ValueError:\n    print(\"Please enter a whole number\")\nfinally:\n    print(\"Finished\")",
    "expectedBehavior": "The conversion raises ValueError; except handles it; finally always runs.",
    "guidedPractice": "Convert user-supplied text to float with a friendly error instead of a crash.",
    "applyChallenge": "Create safe_divide(a, b) handling division by zero and testing both branches.",
    "knowledgeChecks": [
      {
        "question": "Which exception is raised by int(\"abc\")?",
        "answer": "ValueError"
      },
      {
        "question": "What does finally do?",
        "answer": "Runs whether or not an exception occurs"
      },
      {
        "question": "Should errors be silently ignored?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Traceback annotator and side-by-side failing/fixed runs.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner edits a try/except conversion and causes or resolves ValueError; Run distinguishes handled result from traceback.",
    "accuracyNote": "",
    "sourceSummary": "Exceptions signal runtime problems. try and except handle expected errors; learners read messages and debug issues.",
    "authoredExplanation": "Handle errors you can respond to, such as invalid numeric input or a missing file. Keep the try block small and avoid catching every exception, which can hide bugs.",
    "referenceOutput": "Please enter a whole number\nFinished",
    "commonMistake": "Avoid bare except blocks and silent error handling; catch the expected exception and explain the recovery."
  },
  {
    "number": 19,
    "level": "Intermediate Python",
    "title": "Recursion",
    "learnerOutcome": "Trace recursive calls and identify a stopping base case.",
    "prerequisite": "Lessons 01–18 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Recursion: function calls itself",
      "Base case and recursive case",
      "Call stack visualization",
      "Tracing factorial on a small integer",
      "Tradeoffs with iterative alternatives",
      "Recursion depth limits and risk of nontermination"
    ],
    "workedCode": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\nprint(factorial(4))",
    "expectedBehavior": "Call chain factorial(4) → 4*3*2*1 → 24. Use nonnegative inputs in examples.",
    "guidedPractice": "Trace the calls for factorial(3), labeling the base case.",
    "applyChallenge": "Implement recursive sum of a nonnegative integer list with a correct empty-list base case.",
    "knowledgeChecks": [
      {
        "question": "What stops recursion?",
        "answer": "A base case"
      },
      {
        "question": "What is factorial(4)?",
        "answer": "24"
      },
      {
        "question": "Can uncontrolled recursion fail?",
        "answer": "Yes, e.g., RecursionError"
      }
    ],
    "pageUiNeed": "Collapsible call-stack trace with return-value unwinding.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner modifies recursive factorial/nested sum example; Run handles valid and base cases; limit recursion/time resources.",
    "accuracyNote": "",
    "sourceSummary": "Recursion occurs when a function calls itself. A base case stops further calls; compare recursive solutions with loops.",
    "authoredExplanation": "Each recursive call should move toward a base case. Calls use memory, so recursion is best for naturally nested structures or teaching problem decomposition, not automatically better than a loop.",
    "referenceOutput": "24",
    "commonMistake": "A recursive function needs a base case and each recursive step must move toward it."
  },
  {
    "number": 20,
    "level": "Intermediate Python",
    "title": "Algorithms",
    "learnerOutcome": "Describe, implement, and compare basic searching/sorting algorithms.",
    "prerequisite": "Lessons 01–19 as appropriate; directly builds on the previous topic",
    "discussion": [
      "An algorithm as a finite step-by-step procedure",
      "Linear search and binary search assumptions",
      "Bubble sort or insertion sort for learning",
      "Big-O intuition: O(n), O(log n), O(n²)",
      "Correctness and edge cases (empty lists, duplicates)",
      "Built-in sorted() and when to favor tested library code"
    ],
    "workedCode": "def linear_search(items, target):\n    for index, value in enumerate(items):\n        if value == target:\n            return index\n    return -1\nprint(linear_search([3, 7, 9], 7))",
    "expectedBehavior": "Outputs 1. Show how a search visits positions until matching or exhausting items.",
    "guidedPractice": "Trace search for existing and missing values and count comparisons.",
    "applyChallenge": "Implement insertion sort and compare output with sorted() on several datasets.",
    "knowledgeChecks": [
      {
        "question": "What is an algorithm?",
        "answer": "A defined procedure to solve a problem"
      },
      {
        "question": "Must binary search input be sorted?",
        "answer": "Yes"
      },
      {
        "question": "What does O(n) roughly indicate?",
        "answer": "Work scales linearly with input size"
      }
    ],
    "pageUiNeed": "Step-by-step algorithm animation and comparison counter, no fabricated benchmark claims.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes sorting/search input and runs algorithm to see output; optionally show verified step trace, not animated fiction.",
    "accuracyNote": "",
    "sourceSummary": "Algorithms are step-by-step problem-solving procedures. The proposal introduces searching, sorting, and comparing efficiency.",
    "authoredExplanation": "A linear search checks items one by one and takes time proportional to the list length. Sorting can make repeated searches easier. First choose a correct, readable approach, then measure performance if needed.",
    "referenceOutput": "1",
    "commonMistake": "Binary search requires sorted input. Do not claim a performance benchmark without measuring it."
  },
  {
    "number": 21,
    "level": "Intermediate Python",
    "title": "Object-Oriented Programming",
    "learnerOutcome": "Define classes, instantiate objects, and access attributes/methods.",
    "prerequisite": "Lessons 01–20 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Classes versus instances (objects)",
      "Attributes store object data",
      "Methods define object behavior",
      "self is the instance reference by convention",
      "Instantiating multiple distinct objects",
      "When OOP helps model real entities"
    ],
    "workedCode": "class Dog:\n    def bark(self):\n        return \"Woof!\"\ndog = Dog()\nprint(dog.bark())",
    "expectedBehavior": "An instance calls a method and receives Woof!. Constructors are introduced in Lesson 22.",
    "guidedPractice": "Create a Book class with a describe() method, then instantiate two books.",
    "applyChallenge": "Model a Student class that exposes a short profile message.",
    "knowledgeChecks": [
      {
        "question": "What is a class?",
        "answer": "A blueprint defining object data/behavior"
      },
      {
        "question": "What is an instance?",
        "answer": "A created object of a class"
      },
      {
        "question": "What does self conventionally refer to?",
        "answer": "The instance"
      }
    ],
    "pageUiNeed": "Class-to-instance diagram and simple attribute inspector.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes class properties, instantiates objects, and calls a method; Run displays object method result.",
    "accuracyNote": "",
    "sourceSummary": "OOP groups related data and behavior in classes and objects. Learners create classes and instances.",
    "authoredExplanation": "A class describes a kind of object; an instance is one concrete object. Put behavior near the data it uses, while keeping a small example simple enough to understand.",
    "referenceOutput": "Woof!",
    "commonMistake": "A class defines behavior; an instance is one created object with its own state."
  },
  {
    "number": 22,
    "level": "Intermediate Python",
    "title": "Constructors",
    "learnerOutcome": "Initialize instance attributes through __init__.",
    "prerequisite": "Lessons 01–21 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Object creation and initialization lifecycle",
      "__init__(self, ...) and instance attributes",
      "Required/default parameters",
      "Different instances with independent state",
      "Light input validation on construction",
      "Why __init__ is an initializer, not strictly the object allocator"
    ],
    "workedCode": "class Student:\n    def __init__(self, name, grade=0):\n        self.name = name\n        self.grade = grade\nstudent = Student(\"Ana\", 92)\nprint(student.name, student.grade)",
    "expectedBehavior": "Prints Ana 92. The __init__ method sets attributes on the new instance.",
    "guidedPractice": "Add a method passed() that checks a grade threshold.",
    "applyChallenge": "Build a Product class with name, price, and stock, with validation for nonnegative values.",
    "knowledgeChecks": [
      {
        "question": "What special method initializes instance attributes?",
        "answer": "__init__"
      },
      {
        "question": "Where is instance data stored?",
        "answer": "Attributes such as self.name"
      },
      {
        "question": "Can constructor parameters have defaults?",
        "answer": "Yes"
      }
    ],
    "pageUiNeed": "Instance creation timeline and editable constructor argument panel.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner modifies __init__ arguments/defaults and instantiates two objects; Run prints constructed attributes.",
    "accuracyNote": "Correct potential misconception: __init__ initializes an already created instance; __new__ participates in object creation.",
    "sourceSummary": "The __init__ method initializes instance attributes when an object is created.",
    "authoredExplanation": "Python calls __init__ after allocating a new instance. Store each object's starting state there so every instance is valid immediately after construction.",
    "referenceOutput": "Ana 92",
    "commonMistake": "__init__ initializes a new instance; it is not the object allocator."
  },
  {
    "number": 23,
    "level": "Intermediate Python",
    "title": "OOP Principles",
    "learnerOutcome": "Illustrate encapsulation, inheritance, polymorphism, and abstraction in small designs.",
    "prerequisite": "Lessons 01–22 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Encapsulation and public interfaces; Python naming conventions",
      "Inheritance and class reuse",
      "Method overriding as a form of polymorphism",
      "Common interfaces and duck typing",
      "Abstraction: hide implementation details",
      "Favor simple composition when inheritance adds unnecessary complexity"
    ],
    "workedCode": "class Animal:\n    def speak(self):\n        return \"...\"\nclass Cat(Animal):\n    def speak(self):\n        return \"Meow\"\nprint(Cat().speak())",
    "expectedBehavior": "Cat overrides speak() and prints Meow. Discuss method dispatch without claiming privacy is enforced by underscores.",
    "guidedPractice": "Create Dog and Cat subclasses of Animal and call speak() on both in a loop.",
    "applyChallenge": "Model two payment methods with the same pay(amount) interface and contrasting behavior.",
    "knowledgeChecks": [
      {
        "question": "What is inheritance?",
        "answer": "A class derives behavior from another"
      },
      {
        "question": "What is method overriding?",
        "answer": "Redefining inherited behavior"
      },
      {
        "question": "Does a leading underscore enforce private access?",
        "answer": "No, it is a convention"
      }
    ],
    "pageUiNeed": "Inheritance tree and polymorphic method-call cards.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner overrides a subclass method and calls both parent/child; Run demonstrates actual polymorphic output.",
    "accuracyNote": "",
    "sourceSummary": "OOP principles include inheritance, encapsulation, polymorphism, and abstraction. Learners extend classes and override methods.",
    "authoredExplanation": "Inheritance can share a clear common interface, but deep class trees are hard to change. Polymorphism lets different objects respond to the same method call. Keep internal state behind methods when that helps protect invariants.",
    "referenceOutput": "Meow",
    "commonMistake": "A leading underscore communicates a convention; it does not enforce private access in Python."
  },
  {
    "number": 24,
    "level": "Intermediate Python",
    "title": "Advanced Python Tools",
    "learnerOutcome": "Explain iterators, generators, decorators, and context managers at an introductory level.",
    "prerequisite": "Lessons 01–23 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Iterator protocol iter()/next() and StopIteration",
      "yield creates a generator of values lazily",
      "Memory-related motivation without overstated guarantees",
      "Decorator functions wrap callables",
      "Context manager protocol and the with statement",
      "One concise real-world use for each tool"
    ],
    "workedCode": "def countdown(start):\n    while start > 0:\n        yield start\n        start -= 1\nprint(list(countdown(3)))",
    "expectedBehavior": "Outputs [3, 2, 1]. yield suspends and resumes the generator.",
    "guidedPractice": "Build a generator producing even numbers up to a limit.",
    "applyChallenge": "Create a logging decorator and demonstrate a with context manager using a sandbox text file.",
    "knowledgeChecks": [
      {
        "question": "What keyword produces values from a generator?",
        "answer": "yield"
      },
      {
        "question": "What happens when an iterator is exhausted?",
        "answer": "StopIteration"
      },
      {
        "question": "What statement commonly uses context managers?",
        "answer": "with"
      }
    ],
    "pageUiNeed": "Generator execution timeline, iterator next-step control, and decorator flow diagram.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes generator yield/iterator logic and reruns; Run prints yielded values without assuming all iterator states are inspectable.",
    "accuracyNote": "",
    "sourceSummary": "Iterators return values one at a time; generators produce sequences without storing all values. Decorators and context managers support reusable behavior.",
    "authoredExplanation": "A generator pauses at yield and resumes when requested, so it can process a large sequence incrementally. A context manager reliably performs setup and cleanup around a block.",
    "referenceOutput": "[3, 2, 1]",
    "commonMistake": "Generators pause at yield. Laziness can help process values incrementally, but does not guarantee every program uses less memory."
  },
  {
    "number": 25,
    "level": "Intermediate Python",
    "title": "Functional Programming",
    "learnerOutcome": "Pass functions as values and transform iterables with functions/comprehensions.",
    "prerequisite": "Lessons 01–24 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Functions as first-class values",
      "Small lambda expressions",
      "map() and filter() semantics",
      "List comprehensions as an often-clearer alternative",
      "Pure-function intuition and limited side effects",
      "Readable code over nested anonymous expressions"
    ],
    "workedCode": "numbers = [1, 2, 3, 4]\nsquares = list(map(lambda n: n * n, numbers))\nevens = [n for n in numbers if n % 2 == 0]\nprint(squares)\nprint(evens)",
    "expectedBehavior": "Outputs [1, 4, 9, 16] and [2, 4]. Compare two ways to express transformations.",
    "guidedPractice": "Use filter() to select positive numbers, then rewrite with a comprehension.",
    "applyChallenge": "Transform a list of product records to discounted prices without mutating originals.",
    "knowledgeChecks": [
      {
        "question": "What is lambda?",
        "answer": "A small anonymous function expression"
      },
      {
        "question": "What does filter() retain?",
        "answer": "Elements whose predicate is truthy"
      },
      {
        "question": "Can functions be passed as arguments?",
        "answer": "Yes"
      }
    ],
    "pageUiNeed": "Side-by-side transformations displaying original and result lists.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner edits map/filter or a comprehension to transform a list; Run displays resultant list; Check uses sample arrays.",
    "accuracyNote": "",
    "sourceSummary": "Functions can be values and passed around. The slides introduce lambda, map(), filter(), and comprehensions.",
    "authoredExplanation": "A lambda is best for a short expression. For many transformations, a named function or comprehension can be easier to read. map and filter return iterators in Python 3.",
    "referenceOutput": "[1, 4, 9, 16]\n[2, 4]",
    "commonMistake": "Avoid deeply nested lambda/map/filter expressions when a named function or comprehension is easier to read."
  },
  {
    "number": 26,
    "level": "Intermediate Python",
    "title": "Regex & Date/Time",
    "learnerOutcome": "Match simple text patterns and perform calendar-aware datetime operations.",
    "prerequisite": "Lessons 01–25 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Raw regex strings and re.search/re.findall",
      "Character classes and quantifiers, with escaping",
      "Why simple regex does not fully validate arbitrary email addresses",
      "datetime.date / datetime.datetime / timedelta",
      "Parsing with strptime and formatting with strftime",
      "Naive versus timezone-aware datetimes at a conceptual level"
    ],
    "workedCode": "import re\nfrom datetime import date, timedelta\ntext = \"Orders: 12 and 35\"\nprint(re.findall(r\"\\d+\", text))\nprint(date(2026, 10, 27) + timedelta(days=7))",
    "expectedBehavior": "Finds 12 and 35; adds seven calendar days to the illustrative date.",
    "guidedPractice": "Extract hashtags from a string and format a fixed date as YYYY-MM-DD.",
    "applyChallenge": "Build a deadline checker that reports whole-day difference between two supplied ISO dates.",
    "knowledgeChecks": [
      {
        "question": "What does re.findall() return?",
        "answer": "All nonoverlapping matches as a list"
      },
      {
        "question": "What is timedelta for?",
        "answer": "Representing time differences"
      },
      {
        "question": "Is a naive datetime timezone-aware?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Regex match highlighter and date arithmetic calendar preview.",
    "runtimeMode": "python-run",
    "handsOnInteraction": "Learner changes regex pattern and fixed date inputs; Run displays matches/date differences; highlight actual matches only if derived from code.",
    "accuracyNote": "Keep sample dates explicitly illustrative, not tied to current date.",
    "sourceSummary": "Regular expressions find text patterns. Date and time tools format dates and calculate time differences.",
    "authoredExplanation": "Regex is useful for structured pattern checks, but simple string methods are easier for simple tasks. Use datetime objects for date arithmetic instead of comparing formatted text.",
    "referenceOutput": "['12', '35']\n2026-11-03",
    "commonMistake": "A simple regular expression is not complete validation for every email address. Naive datetime values have no timezone information."
  },
  {
    "number": 27,
    "level": "Intermediate Python",
    "title": "Package Management",
    "learnerOutcome": "Understand pip, dependencies, requirements, and virtual environments.",
    "prerequisite": "Lessons 01–26 as appropriate; directly builds on the previous topic",
    "discussion": [
      "What third-party packages are and how they differ from standard library",
      "pip commands run in a terminal, not inside Python source",
      "python -m pip install package pattern",
      "python -m venv .venv and activation differences",
      "requirements.txt and reproducibility",
      "Package trust, version constraints, and dependency conflicts"
    ],
    "workedCode": "# Demonstration script AFTER installing a package externally:\nimport matplotlib\nprint(\"Matplotlib import available\")",
    "expectedBehavior": "The code imports a dependency only when present. Show shell commands as non- executable terminal snippets.",
    "guidedPractice": "Create a fresh virtual environment locally, install one trusted demo library, and freeze dependencies.",
    "applyChallenge": "Prepare project setup instructions listing Python requirements and exact install/test commands.",
    "knowledgeChecks": [
      {
        "question": "What tool installs Python packages?",
        "answer": "pip"
      },
      {
        "question": "What is a virtual environment?",
        "answer": "An isolated project environment"
      },
      {
        "question": "Where is python -m pip install used?",
        "answer": "Terminal/shell"
      }
    ],
    "pageUiNeed": "Terminal-command cards, OS activation tabs, and dependency tree illustration.",
    "runtimeMode": "terminal-guide",
    "handsOnInteraction": "Provide copyable pip/venv commands, OS-specific activation, and a checklist; no simulated shell execution in Python editor. Optional import test only if dependency installed.",
    "accuracyNote": "If external packages are unsupported in browser runner, provide a read-only terminal simulation and local instructions.",
    "sourceSummary": "pip installs libraries. Virtual environments isolate each project's dependencies.",
    "authoredExplanation": "A virtual environment gives a project its own interpreter environment and installed packages. Record direct dependencies so another developer can reproduce the setup. Do not install a package just because its name looks familiar; check its source.",
    "referenceOutput": null,
    "commonMistake": "pip and virtual-environment commands belong in a terminal. Do not install packages by typing shell commands into Python source."
  },
  {
    "number": 28,
    "level": "Advanced Python",
    "title": "Database Integration",
    "learnerOutcome": "Connect Python with SQLite and perform safe CRUD basics.",
    "prerequisite": "Lessons 01–27 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Tables, rows, columns, keys",
      "SQLite via Python sqlite3 for the introductory implementation",
      "CREATE TABLE, INSERT, SELECT, UPDATE, DELETE",
      "Parameterized queries with ? placeholders to avoid SQL injection",
      "Transactions, commit(), and context management",
      "Handling connection errors and showing changes in data"
    ],
    "workedCode": "import sqlite3\nwith sqlite3.connect(\":memory:\") as conn:\n    conn.execute(\"CREATE TABLE items (id INTEGER, name TEXT)\")\n    conn.execute(\"INSERT INTO items VALUES (?, ?)\", (1, \"Notebook\"))\n    rows = conn.execute(\"SELECT name FROM items WHERE id = ?\", (1,)).fetchall()\n    print(rows)",
    "expectedBehavior": "Outputs [('Notebook',)]. Database is in memory and resets on each run.",
    "guidedPractice": "Insert two more records with bound parameters and query by ID.",
    "applyChallenge": "Build a minimal inventory CRUD example and demonstrate tests for absent records.",
    "knowledgeChecks": [
      {
        "question": "What does SELECT do?",
        "answer": "Retrieves rows"
      },
      {
        "question": "Why use ? placeholders?",
        "answer": "Safely bind values and reduce SQL injection risk"
      },
      {
        "question": "What does commit do?",
        "answer": "Persist transaction changes"
      }
    ],
    "pageUiNeed": "SQL table viewer, query/result split view, resettable SQLite sandbox.",
    "runtimeMode": "sqlite",
    "handsOnInteraction": "Learner changes parameterized SQLite INSERT/SELECT in isolated in- memory database; Run displays actual rows and table preview if available.",
    "accuracyNote": "Never concatenate raw user data into SQL statements. Browser execution requires SQLite- capable engine or server isolation.",
    "sourceSummary": "Databases store structured data. The slides introduce SQL SELECT and INSERT and connecting Python to a sample database.",
    "authoredExplanation": "Use parameterized SQL for values instead of building queries with string concatenation. This SQLite example uses Python's standard library and an in-memory database, so it does not need an external service.",
    "referenceOutput": "[('Notebook',)]",
    "commonMistake": "Never build SQL by joining raw user input into a query; use parameter placeholders and understand when a transaction commits."
  },
  {
    "number": 29,
    "level": "Advanced Python",
    "title": "APIs & Web Data",
    "learnerOutcome": "Explain HTTP, parse JSON, and handle predictable API outcomes.",
    "prerequisite": "Lessons 01–28 as appropriate; directly builds on the previous topic",
    "discussion": [
      "APIs as interfaces to external services",
      "Request/response flow, GET, status codes 200/404/500",
      "JSON objects and arrays mapping to Python data",
      "Network errors, timeouts, and response validation",
      "Basic requests usage where supported",
      "Use a local mock API response before any live outbound requests"
    ],
    "workedCode": "import json\nresponse_text = '{\"city\": \"Manila\", \"temp_c\": 29}'\ndata = json.loads(response_text)\nprint(data[\"city\"])\nprint(data[\"temp_c\"])",
    "expectedBehavior": "Parses a mocked JSON response and prints Manila then 29. No external network is required.",
    "guidedPractice": "Inspect three mock responses: valid success, missing field, and invalid JSON.",
    "applyChallenge": "Create a weather-data display consuming a configurable mock endpoint with graceful error states.",
    "knowledgeChecks": [
      {
        "question": "What does JSON represent?",
        "answer": "Structured data in text form"
      },
      {
        "question": "What does HTTP 404 generally mean?",
        "answer": "Resource not found"
      },
      {
        "question": "Should an API client handle timeouts?",
        "answer": "Yes"
      }
    ],
    "pageUiNeed": "Request → response diagram, expandable JSON explorer, mock endpoint selector, error cases.",
    "runtimeMode": "mock-api",
    "handsOnInteraction": "Learner edits json.loads or mock HTTP response handler; Run parses actual in-page fixture, including missing-field and invalid JSON cases.",
    "accuracyNote": "No production secrets or API tokens in browser code, static lesson content, or source repository.",
    "sourceSummary": "APIs let programs exchange data. The slides introduce HTTP requests, JSON responses, and a controlled example API.",
    "authoredExplanation": "An HTTP response has a status and a body. JSON values map to Python dictionaries and lists. Check status and validate the shape of external data before using it; this example parses a fixed response without needing network access.",
    "referenceOutput": "Manila\n29",
    "commonMistake": "Use mock responses first. Validate status, JSON shape, errors, and timeouts; never place API secrets in learner code."
  },
  {
    "number": 30,
    "level": "Advanced Python",
    "title": "Testing & Deployment",
    "learnerOutcome": "Write automated tests and prepare a small Python app for delivery.",
    "prerequisite": "Lessons 01–29 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Why tests protect expected behavior",
      "Assertions and unittest or pytest basics",
      "Happy-path, edge, and error-case tests",
      "Run tests and interpret failures",
      "Basic project README, requirements, configuration",
      "Deployment meaning and safe handoff; no assumption that hosting is configured"
    ],
    "workedCode": "def add(a, b):\n    return a + b\ndef test_add():\n    assert add(2, 3) == 5\ntest_add()\nprint(\"Test passed\")",
    "expectedBehavior": "Assert succeeds; prints Test passed. Production test discovery would use unittest/pytest.",
    "guidedPractice": "Write and run tests for a function including normal and boundary cases.",
    "applyChallenge": "Package one previous exercise with a README, requirements, tests, and run instructions.",
    "knowledgeChecks": [
      {
        "question": "What does assert check?",
        "answer": "A condition expected to be true"
      },
      {
        "question": "What is an edge case?",
        "answer": "An unusual or boundary input"
      },
      {
        "question": "Must deployment mean publishing publicly?",
        "answer": "No"
      }
    ],
    "pageUiNeed": "Test result badges, per-case explanation, sample project folder layout, and deployment checklist.",
    "runtimeMode": "test-runner",
    "handsOnInteraction": "Learner edits function or assert tests; Run produces actual pass/fail/exception details. Deployment stays an instructional checklist.",
    "accuracyNote": "Do not falsely show “deployed” if the feature merely generates package files.",
    "sourceSummary": "Tests check expected behavior and uncover problems. The slides ask learners to prepare a small project for presentation or delivery.",
    "authoredExplanation": "A unit test checks one behavior with known inputs and expected outputs. Tests are executable documentation. Deployment also needs a reproducible environment, clear startup steps, and configuration kept outside source code.",
    "referenceOutput": "Test passed",
    "commonMistake": "A passing example is not full test coverage, and generating project files does not mean an app has been deployed."
  },
  {
    "number": 31,
    "level": "Advanced Python",
    "title": "Python Graphs: Matplotlib",
    "learnerOutcome": "Create labeled line and scatter graphs, and interpret trends.",
    "prerequisite": "Lessons 01–30 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Graphs represent numeric relationships",
      "When to use line graphs versus scatter plots",
      "Matplotlib pyplot basics: figure, plot/scatter, xlabel, ylabel, title",
      "Legends, grid, axis range, and readability",
      "Render plots in a supported runtime",
      "Read the graph: increase, decrease, clusters, outliers (without asserting causation)"
    ],
    "workedCode": "import matplotlib.pyplot as plt\nx = [1, 2, 3, 4]\ny = [2, 5, 4, 7]\nplt.plot(x, y, marker=\"o\")\nplt.xlabel(\"Week\")\nplt.ylabel(\"Tasks completed\")\nplt.title(\"Weekly progress\")\nplt.show()",
    "expectedBehavior": "Demonstrates an annotated line plot. Provide a deterministic sample chart image if runtime plotting unavailable.",
    "guidedPractice": "Change a data point and observe the line, axis, and interpretation.",
    "applyChallenge": "Build one line and one scatter plot from sample records, each with readable labels and captions.",
    "knowledgeChecks": [
      {
        "question": "Which plot shows connected change over ordered points?",
        "answer": "Line graph"
      },
      {
        "question": "Which plot shows paired numeric observations?",
        "answer": "Scatter plot"
      },
      {
        "question": "Why label axes?",
        "answer": "To define units and meaning"
      }
    ],
    "pageUiNeed": "Chart preview panel with graph type toggle, code editor, and download/export only if actually supported.",
    "runtimeMode": "plot-preview",
    "handsOnInteraction": "Learner edits x/y lists and axis labels; Run should show true Matplotlib output if supported and display real errors; otherwise label fixed screenshot/reference and offer local-running instructions.",
    "accuracyNote": "Matplotlib may require a server-side isolated worker or pre-rendered fallback; do not assume universal in-browser support.",
    "sourceSummary": "Graphs show relationships and trends. The slides use Matplotlib for line graphs and scatter plots, with axis labels and titles.",
    "authoredExplanation": "Choose a line plot when values are ordered, often over time. A scatter plot is useful for relationships between paired measurements. Labels and units help readers interpret a chart.",
    "referenceOutput": null,
    "referenceOutputNote": "The chart preview is a static reference illustration, not a live Matplotlib or Pandas run.",
    "commonMistake": "A line or scatter chart shows a relationship, not proof of causation. Label axes and units."
  },
  {
    "number": 32,
    "level": "Advanced Python",
    "title": "Python Charts: Seaborn, Plotly & Pandas",
    "learnerOutcome": "Select and create categorical and distribution charts using appropriate libraries.",
    "prerequisite": "Lessons 01–31 as appropriate; directly builds on the previous topic",
    "discussion": [
      "Chart choice: bar for categories, histogram for distributions, pie sparingly for part-to-whole",
      "Pandas DataFrame plotting and Matplotlib backend",
      "Seaborn statistical plots (e.g., histplot, barplot)",
      "Plotly interactive plotting when installed",
      "Readable axes, titles, units, legend and accessible labeling",
      "Interpreting results without cherry-picked scales",
      "Package/runtime availability and static vs interactive previews"
    ],
    "workedCode": "import pandas as pd\nimport matplotlib.pyplot as plt\nsales = pd.DataFrame({\"item\": [\"A\", \"B\", \"C\"], \"count\": [8, 12, 5]})\nsales.plot.bar(x=\"item\", y=\"count\", legend=False)\nplt.ylabel(\"Units sold\")\nplt.title(\"Sales by item\")\nplt.tight_layout()\nplt.show()",
    "expectedBehavior": "Creates a labeled Pandas bar chart. Supplement with distinct Seaborn histogram and Plotly bar examples in tabs.",
    "guidedPractice": "Compare bar versus histogram for two sample datasets; inspect the effect of changing axis labels.",
    "applyChallenge": "Create a three-chart mini dashboard with an explicit rationale for each chart type.",
    "knowledgeChecks": [
      {
        "question": "Which plot compares category totals?",
        "answer": "Bar chart"
      },
      {
        "question": "What does a histogram summarize?",
        "answer": "Distribution of numeric values"
      },
      {
        "question": "Can a chart be misleading without units?",
        "answer": "Yes"
      }
    ],
    "pageUiNeed": "Library tabs (Pandas / Seaborn / Plotly), chart gallery, legend explainer, and actual- runtime or verified fallback.",
    "runtimeMode": "plot-preview",
    "handsOnInteraction": "Tabs for Pandas/Seaborn/Plotly with separate editable starters. Run and preview only installed/supported backends; clearly disable unsupported tabs with accurate instructions.",
    "accuracyNote": "Do not conflate bar plots with histograms; Plotly interactive previews require a supported renderer.",
    "sourceSummary": "Charts compare categories, proportions, and distributions. The slides mention bar charts, pie charts, histograms, Seaborn, Plotly, and Pandas plotting.",
    "authoredExplanation": "A bar chart compares separate categories; a histogram shows a numeric distribution. Pie charts work best for a small number of parts that add to a meaningful whole. Seaborn, Plotly, and Pandas provide additional plotting interfaces.",
    "referenceOutput": null,
    "referenceOutputNote": "The chart preview is a static reference illustration, not a live Matplotlib or Pandas run.",
    "commonMistake": "A bar chart compares categories; a histogram summarizes a numeric distribution. Always explain axes and units."
  }
];

export const PYTHON_LEVELS = [
  { title: "Basic Python", first: 1, last: 15, count: 15 },
  { title: "Intermediate Python", first: 16, last: 27, count: 12 },
  { title: "Advanced Python", first: 28, last: 32, count: 5 },
];

export const PYTHON_LESSON_BY_TITLE = Object.fromEntries(PYTHON_LESSONS.map((lesson) => [lesson.title.toLocaleLowerCase(), lesson]));
PYTHON_LESSON_BY_TITLE["python graphs"] = PYTHON_LESSONS[30];
PYTHON_LESSON_BY_TITLE["python charts"] = PYTHON_LESSONS[31];
