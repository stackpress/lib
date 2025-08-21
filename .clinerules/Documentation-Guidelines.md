as follows:

1. __Documentation Structure__:

   - Use separate markdown files for each major component or class (e.g., `EventEmitter`, `ExpressEmitter`).
   - Ensure each file follows a consistent structure with sections for features, public properties, methods, and examples.
   - A description should always follow a header. If you can determine a proper description, then talk about what the next sections are about. I you made the same mistake with #### methods. FYI i define headers as lines that start with a hashtag.

2. __Method Documentation__:

   - Document each method with a clear description, parameter table, and example usage.
   - Avoid using tables for return values; instead, describe the return type in the method description.

3. __Parameter Tables__:

   - Use tables to list parameters for each method, including type, default value (if applicable), and description.

4. __Examples__:

   - Provide practical examples for each method to illustrate usage.
   - Ensure examples are relevant and demonstrate typical use cases.

5. __Public vs. Protected/Private__:

   - Focus on documenting public properties and methods.
   - Avoid documenting protected or private members unless necessary for understanding public API behavior.
   - Just call public properties, properties in the documentation.

6. __Type Parameters__:

   - Clearly define type parameters for generic classes (e.g., `ItemQueue<I>`, `TaskQueue<A>`).
   - Provide examples that demonstrate how to declare and use these types.

7. __Feedback Integration__:

   - Continuously integrate user feedback to refine documentation.
   - Address specific critiques, such as missing methods or incorrect examples, promptly.

8. __Consistency and Clarity__:

   - Maintain consistency in formatting, terminology, and style across all documentation files.
   - Ensure clarity and accessibility for the target audience, including junior developers.

9. __Char Length__:

Code should be written like a book. A book has pages and each line of each page has a common max length. Imagine a child's eye moving from left to right when reading a book. As that child reads while growing up, their eyes move a lot less. Eventually a person moves from letter to letter, to word by word, to line by line, and some can even do page by page (speed reading). This is because as a person reads more and more they develop their sight peripherals, but there is a limit to how far peripherals can reach (less than 180 degrees). Around when an individual's sight peripherals reach their limit is when the eyes need to move. Eyes moving constantly without rest can cause eye stress. Unlike a book, there is no max length a line of code could be and contributes to eye stress for everyone reading code not having a standard.

> Unless it cannot be avoided, every line of code should not exceed 80 characters.