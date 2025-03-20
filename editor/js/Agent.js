// We'll import directly using ES modules with properly named exports
import { GoogleGenAI } from "@google/genai";
import * as Commands from "./commands/Commands.js";
import {
  Vector3,
  BoxGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  PointLight,
  AmbientLight,
  Color,
  CylinderGeometry,
  Group,
  PlaneGeometry,
  TorusGeometry,
  RingGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  TetrahedronGeometry,
  OctahedronGeometry,
  CircleGeometry,
  Euler,
} from "../../build/three.module.js";

// We'll use the import from the HTML's importmap
// import { GoogleGenerativeAI } from "@google/genai";

class Agent {
  constructor(editor) {
    this.editor = editor;
    this.signals = editor.signals;

    // Create custom agent signals
    this.agentSignals = {
      agentResponse: new signals.Signal(),
      agentThinking: new signals.Signal(),
      agentStepAdded: new signals.Signal(),
    };

    this.container = new Group();
    this.dom = document.createElement("div");
    this.dom.id = "agent";
    this.lastModifiedObject = null; // Track last modified object

    // Create UI elements
    this.createUI();

    // Bind methods
    this.processQuery = this.processQuery.bind(this);
    this.generateRandomColor = this.generateRandomColor.bind(this);
    this.generateUniqueObjectName = this.generateUniqueObjectName.bind(this);
  }

  generateUniqueObjectName(baseName) {
    const scene = this.editor.scene;
    let counter = 1;
    let name;

    // Keep incrementing counter until we find an unused name
    do {
      name = `${baseName}${counter}`;
      counter++;
    } while (scene.getObjectByName(name) !== undefined);

    return name;
  }

  generateRandomColor() {
    const randomHex = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + randomHex.padStart(6, "0");
  }

  createUI() {
    // Create input area
    const input = document.createElement("textarea");
    input.placeholder = "What do you want to do?";

    // Prevent keyboard shortcuts when focused
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();

      if (e.key === "Enter") {
        if (e.shiftKey) {
          // Allow Shift+Enter for newlines
          return;
        }

        e.preventDefault();
        executeQuery();
      }
    });

    // Create a container for input and button
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "relative";
    inputContainer.appendChild(input);

    // Create submit button
    const button = document.createElement("button");
    button.textContent = "SEND";

    // Position the button inside the input
    button.style.position = "absolute";
    button.style.right = "10px";
    button.style.bottom = "12px";
    button.style.zIndex = "1";

    inputContainer.appendChild(button);

    // Create steps container for visualizing agent steps
    const stepsContainer = document.createElement("div");
    stepsContainer.className = "agent-steps";

    // Store reference to the steps container
    this.stepsContainer = stepsContainer;

    const executeQuery = async () => {
      if (button.disabled || !input.value.trim()) return;

      button.disabled = true;
      input.disabled = true;

      // Clear previous steps
      this.stepsContainer.innerHTML = "";

      await this.processQuery(input.value);

      input.value = "";
      button.disabled = false;
      input.disabled = false;
      input.focus();
    };

    // Add event listeners
    button.addEventListener("click", executeQuery);

    // Append elements
    this.dom.appendChild(inputContainer);
    this.dom.appendChild(stepsContainer);
  }

  addStep(type, detail) {
    const step = document.createElement("div");
    step.className = "agent-step";

    const icon = document.createElement("span");
    icon.className = "agent-step-icon";
    icon.textContent =
      type === "thinking" ? "🤔" : type === "function" ? "⚙️" : "💬";

    const content = document.createElement("div");
    content.className = "agent-step-content";

    const title = document.createElement("div");
    title.className = "agent-step-title";
    title.textContent =
      type === "thinking"
        ? "Thinking..."
        : type === "function"
        ? `${detail.function}`
        : "Response";

    content.appendChild(title);

    if (detail && type === "function") {
      const params = document.createElement("div");
      params.className = "agent-step-params";
      params.textContent =
        Object.keys(detail.params || {}).length > 0
          ? JSON.stringify(detail.params)
          : "(no parameters)";
      content.appendChild(params);
    } else if (type === "response") {
      const message = document.createElement("div");
      message.className = "agent-step-message";
      message.textContent = detail;
      content.appendChild(message);
    }

    step.appendChild(icon);
    step.appendChild(content);
    this.stepsContainer.appendChild(step);

    // Auto-scroll to the bottom
    this.stepsContainer.scrollTop = this.stepsContainer.scrollHeight;

    // Dispatch signal
    this.agentSignals.agentStepAdded.dispatch(type, detail);
  }

  // Helper method to detect if we're building a multi-part object
  isMultiPartObjectRequest(query) {
    const multiPartTerms = [
      "car",
      "vehicle",
      "airplane",
      "plane",
      "house",
      "building",
      "robot",
      "character",
      "person",
      "animal",
      "furniture",
      "chair",
      "table",
      "snowman",
      "tree",
      "flower",
      "multiple",
      "scene",
      "environment",
      "create a",
      "build a",
      "make a",
    ];

    return multiPartTerms.some((term) =>
      query.toLowerCase().includes(term.toLowerCase())
    );
  }

  async processQuery(query) {
    if (!query.trim()) return;

    try {
      // Show single thinking message at the start
      this.agentSignals.agentThinking.dispatch();
      this.addStep("thinking");

      // Create instance of GoogleGenAI with the Gemini API key
      const apiKey = "GEMINI_API_KEY";
      const ai = new GoogleGenAI({ apiKey });

      console.log(
        "AGENT DEBUG: GoogleGenAI SDK version:",
        ai.version || "unknown"
      );

      // Get scene information
      const sceneInfo = this.getSceneInfo();

      // Define available functions
      const functionDefinitions = this.getFunctionDefinitions();

      // Prepare system prompt
      const systemPrompt = this.getSystemPrompt(sceneInfo);

      // Set up configuration options
      const generationConfig = {
        temperature: 0.2,
        maxOutputTokens: 2048,
      };

      // Tools configuration for function calling
      const tools = [
        {
          functionDeclarations: functionDefinitions.functionDeclarations,
        },
      ];

      try {
        // First send a system message to establish context
        await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: systemPrompt,
          generationConfig,
          tools,
        });

        console.log(
          "AGENT DEBUG: Successfully initialized model and sent system prompt"
        );

        // Create a chat session with history
        const chat = ai.chats.create({
          model: "gemini-2.0-flash",
          history: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model",
              parts: [
                {
                  text: "I'm ready to help you create and modify your 3D scene.",
                },
              ],
            },
          ],
          config: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            tools: [
              {
                functionDeclarations: functionDefinitions.functionDeclarations,
              },
            ],
          },
        });

        console.log(
          "AGENT DEBUG: Chat object created:",
          chat,
          "Type:",
          typeof chat,
          "Methods:",
          Object.getOwnPropertyNames(Object.getPrototypeOf(chat))
        );

        // First phase: Planning - get a structured plan for building the requested object
        await this.planCreation(chat, query);
      } catch (apiError) {
        console.error("AGENT: API error:", apiError);
        this.addStep(
          "response",
          "Sorry, I encountered an API error: " + apiError.message
        );
      }
    } catch (error) {
      console.error("AGENT: Agent error:", error);
      this.addStep(
        "response",
        "Sorry, I encountered an error: " + error.message
      );
    }
  }

  async planCreation(chat, query) {
    // Planning phase: Ask the LLM to create a creation plan
    const planningQuery = `
I need to create a 3D model based on this request: "${query}"

Before creating it, I need you to provide me with a creation plan. Break down the request into:

1. PARTS INVENTORY:
   - List all parts needed to construct the 3D model
   - Specify the geometry type for each part (box, cylinder, sphere, etc.)
   - Suggest dimensions for each part

2. SPATIAL ARRANGEMENT:
   - Describe how parts should be positioned relative to each other
   - Specify orientation (rotations) needed for each part
   - Consider which parts should be created first to serve as reference points

3. ATTRIBUTES:
   - Suggest colors or materials for each part
   - Specify any special visual characteristics

4. CONSTRUCTION SEQUENCE:
   - Provide a step-by-step order for creating parts
   - Start with main/central parts before adding details

Please be specific about positions (x, y, z coordinates) and orientations (rotations) to ensure parts fit together properly. For complex objects, use precise measurements and rotations.

Format your plan in a clear, step-by-step way.
`;

    try {
      console.log("AGENT: Starting planning phase");
      // No additional 'thinking' step here, as we already have one from processQuery

      // DEBUG: Add chat inspection
      console.log(
        "AGENT DEBUG: Chat object before sendMessage:",
        chat,
        "Has sendMessage:",
        typeof chat.sendMessage === "function"
      );

      // Prepare the message content
      const msgContent = {
        role: "user",
        parts: [{ text: planningQuery }],
      };

      console.log(
        "AGENT DEBUG: Preparing to send message with content:",
        JSON.stringify(msgContent)
      );

      try {
        // Try different formats as a debugging approach
        console.log(
          "AGENT DEBUG: Attempting sendMessage with correct params format"
        );

        // FIXED: The sendMessage expects an object with a message property containing the content
        const planResult = await chat.sendMessage({
          message: msgContent,
        });
        console.log("AGENT: Plan result:", JSON.stringify(planResult, null, 2));

        // Extract the text content from the plan result - FIX: use .text property, not .text() function
        // IMPORTANT: Response from chat.sendMessage returns a GenerateContentResponse object
        const planText =
          planResult.text ||
          planResult.candidates?.[0]?.content?.parts?.[0]?.text;

        // Display the plan
        if (planText) {
          this.agentSignals.agentResponse.dispatch(planText);
          this.addStep("response", planText);

          // Second phase: Execution - execute the plan
          await this.executeCreation(chat, query, planText);
        } else {
          this.agentSignals.agentResponse.dispatch(
            "I couldn't create a plan for your request."
          );
          this.addStep(
            "response",
            "I couldn't create a plan for your request."
          );

          // Try a fallback simpler approach for common objects
          await this.fallbackCreation(query);
        }
      } catch (attemptError) {
        console.error(
          "AGENT DEBUG: First attempt failed with error:",
          attemptError
        );
        console.log("AGENT DEBUG: Error name:", attemptError.name);
        console.log("AGENT DEBUG: Error message:", attemptError.message);
        console.log("AGENT DEBUG: Error stack:", attemptError.stack);

        // Add a more helpful error message for the user
        this.addStep(
          "response",
          "I encountered an issue while planning your 3D model. Let me try a simpler approach."
        );

        // Try a fallback creation approach for common objects
        await this.fallbackCreation(query);
      }
    } catch (error) {
      console.error("AGENT: Planning phase error:", error);
      console.log(
        "AGENT DEBUG: Full error details:",
        "Name:",
        error.name,
        "Message:",
        error.message,
        "Stack:",
        error.stack
      );

      this.addStep(
        "response",
        "Error in planning phase: " +
          error.message +
          ". Let me try a simple approach instead."
      );

      // Try a fallback creation approach for common objects
      await this.fallbackCreation(query);
    }
  }

  // New method for fallback creation when planning fails
  async fallbackCreation(query) {
    try {
      console.log("AGENT: Using fallback creation approach for query:", query);
      this.addStep("thinking", "Creating a basic model...");

      // Analyze the query to determine what basic object to create
      const lowerQuery = query.toLowerCase();

      if (
        lowerQuery.includes("house") ||
        lowerQuery.includes("home") ||
        lowerQuery.includes("building")
      ) {
        // Create a simple house
        await this.createSimpleHouse();
      } else if (lowerQuery.includes("car") || lowerQuery.includes("vehicle")) {
        // Create a simple car
        await this.createSimpleCar();
      } else if (lowerQuery.includes("tree") || lowerQuery.includes("plant")) {
        // Create a simple tree
        await this.createSimpleTree();
      } else if (
        lowerQuery.includes("person") ||
        lowerQuery.includes("human") ||
        lowerQuery.includes("character")
      ) {
        // Create a simple character
        await this.createSimpleCharacter();
      } else {
        // Default to a simple cube with some decorations
        await this.createSimpleBox();
      }

      this.addStep(
        "response",
        "I've created a basic model based on your request. You can now modify it further."
      );
    } catch (error) {
      console.error("AGENT: Fallback creation error:", error);
      this.addStep(
        "response",
        "I couldn't create even a simple model. Please try again with different wording."
      );
    }
  }

  // Implement simple creation methods for fallback
  async createSimpleHouse() {
    // Main house body
    await this.executeFunction("addObject", {
      type: "box",
      name: "House Body",
      position: { x: 0, y: 2.5, z: 0 },
      color: "#EEEEEE",
      width: 10,
      height: 5,
      depth: 10,
    });

    // Roof
    await this.executeFunction("addObject", {
      type: "box",
      name: "Roof",
      position: { x: 0, y: 5.5, z: 0 },
      color: "#8B4513",
      width: 12,
      height: 1,
      depth: 12,
    });

    // Door
    await this.executeFunction("addObject", {
      type: "box",
      name: "Door",
      position: { x: 0, y: 1.5, z: 5.1 },
      color: "#8B0000",
      width: 2,
      height: 3,
      depth: 0.2,
    });

    // Window left
    await this.executeFunction("addObject", {
      type: "box",
      name: "Window Left",
      position: { x: -3, y: 3, z: 5.1 },
      color: "#ADD8E6",
      width: 2,
      height: 2,
      depth: 0.2,
    });

    // Window right
    await this.executeFunction("addObject", {
      type: "box",
      name: "Window Right",
      position: { x: 3, y: 3, z: 5.1 },
      color: "#ADD8E6",
      width: 2,
      height: 2,
      depth: 0.2,
    });
  }

  async createSimpleCar() {
    // Car body
    await this.executeFunction("addObject", {
      type: "box",
      name: "Car Body",
      position: { x: 0, y: 1, z: 0 },
      color: "#FF0000",
      width: 5,
      height: 1.5,
      depth: 2.5,
    });

    // Car cabin
    await this.executeFunction("addObject", {
      type: "box",
      name: "Car Cabin",
      position: { x: 0, y: 2, z: 0 },
      color: "#333333",
      width: 3,
      height: 1,
      depth: 2.4,
    });

    // Wheels
    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Wheel Front Left",
      position: { x: -1.5, y: 0.5, z: 1.5 },
      color: "#000000",
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 0.5,
      radialSegments: 16,
    });

    await this.executeFunction("setRotation", {
      object: "Wheel Front Left",
      rotation: { x: 1.5707, y: 0, z: 0 },
    });

    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Wheel Front Right",
      position: { x: -1.5, y: 0.5, z: -1.5 },
      color: "#000000",
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 0.5,
      radialSegments: 16,
    });

    await this.executeFunction("setRotation", {
      object: "Wheel Front Right",
      rotation: { x: 1.5707, y: 0, z: 0 },
    });

    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Wheel Back Left",
      position: { x: 1.5, y: 0.5, z: 1.5 },
      color: "#000000",
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 0.5,
      radialSegments: 16,
    });

    await this.executeFunction("setRotation", {
      object: "Wheel Back Left",
      rotation: { x: 1.5707, y: 0, z: 0 },
    });

    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Wheel Back Right",
      position: { x: 1.5, y: 0.5, z: -1.5 },
      color: "#000000",
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 0.5,
      radialSegments: 16,
    });

    await this.executeFunction("setRotation", {
      object: "Wheel Back Right",
      rotation: { x: 1.5707, y: 0, z: 0 },
    });
  }

  async createSimpleTree() {
    // Tree trunk
    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Tree Trunk",
      position: { x: 0, y: 2, z: 0 },
      color: "#8B4513",
      radiusTop: 0.3,
      radiusBottom: 0.5,
      height: 4,
      radialSegments: 8,
    });

    // Tree top
    await this.executeFunction("addObject", {
      type: "sphere",
      name: "Tree Top 1",
      position: { x: 0, y: 5, z: 0 },
      color: "#228B22",
      radius: 2,
    });

    await this.executeFunction("addObject", {
      type: "sphere",
      name: "Tree Top 2",
      position: { x: 0, y: 6, z: 0 },
      color: "#228B22",
      radius: 1.5,
    });

    await this.executeFunction("addObject", {
      type: "sphere",
      name: "Tree Top 3",
      position: { x: 0, y: 7, z: 0 },
      color: "#228B22",
      radius: 1,
    });
  }

  async createSimpleCharacter() {
    // Head
    await this.executeFunction("addObject", {
      type: "sphere",
      name: "Head",
      position: { x: 0, y: 4.5, z: 0 },
      color: "#FFD700",
      radius: 0.7,
    });

    // Body
    await this.executeFunction("addObject", {
      type: "box",
      name: "Body",
      position: { x: 0, y: 3, z: 0 },
      color: "#FF6347",
      width: 1.5,
      height: 2,
      depth: 0.8,
    });

    // Arms
    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Left Arm",
      position: { x: -1, y: 3.2, z: 0 },
      color: "#FF6347",
      radiusTop: 0.2,
      radiusBottom: 0.2,
      height: 1.5,
      radialSegments: 8,
    });

    await this.executeFunction("setRotation", {
      object: "Left Arm",
      rotation: { x: 0, y: 0, z: 1.5707 },
    });

    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Right Arm",
      position: { x: 1, y: 3.2, z: 0 },
      color: "#FF6347",
      radiusTop: 0.2,
      radiusBottom: 0.2,
      height: 1.5,
      radialSegments: 8,
    });

    await this.executeFunction("setRotation", {
      object: "Right Arm",
      rotation: { x: 0, y: 0, z: -1.5707 },
    });

    // Legs
    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Left Leg",
      position: { x: -0.4, y: 1.2, z: 0 },
      color: "#4682B4",
      radiusTop: 0.25,
      radiusBottom: 0.25,
      height: 1.6,
      radialSegments: 8,
    });

    await this.executeFunction("addObject", {
      type: "cylinder",
      name: "Right Leg",
      position: { x: 0.4, y: 1.2, z: 0 },
      color: "#4682B4",
      radiusTop: 0.25,
      radiusBottom: 0.25,
      height: 1.6,
      radialSegments: 8,
    });
  }

  async createSimpleBox() {
    // Just create a colorful box
    await this.executeFunction("addObject", {
      type: "box",
      name: "Colorful Box",
      position: { x: 0, y: 1, z: 0 },
      color: this.generateRandomColor(),
      width: 2,
      height: 2,
      depth: 2,
    });

    // Add some decorative elements
    await this.executeFunction("addObject", {
      type: "sphere",
      name: "Decoration 1",
      position: { x: 0, y: 2.5, z: 0 },
      color: this.generateRandomColor(),
      radius: 0.5,
    });

    await this.executeFunction("addObject", {
      type: "torus",
      name: "Decoration 2",
      position: { x: 0, y: 1, z: 0 },
      color: this.generateRandomColor(),
      radius: 1.5,
      tube: 0.2,
    });

    await this.executeFunction("setRotation", {
      object: "Decoration 2",
      rotation: { x: 1.5707, y: 0, z: 0 },
    });
  }

  async executeCreation(chat, query, plan) {
    // Execution phase: Execute the creation plan
    const executionQuery = `
I need to create a 3D model based on this request: "${query}"

Here is the plan I've established:
${plan}

Now I need to execute this plan. For each part in the plan:
1. Use the addObject function to create the specified geometry
2. Set the position correctly using setPosition 
3. Set the rotation as needed using setRotation
4. Set the scale as needed using setScale
5. Set colors using setColor

For rotations, remember:
- Rotation values are in RADIANS (not degrees)
- Use Math.PI for 180 degrees (e.g., Math.PI/2 for 90 degrees)

Please execute ONE PART AT A TIME, making sure to follow the position, rotation, and scale specifications from the plan.
Start with the main parts and proceed in a logical sequence.
`;

    try {
      console.log("AGENT: Starting execution phase");
      this.addStep("thinking", "Creating 3D model...");

      // Use the LLM to execute the creation plan with the correct format
      await chat.sendMessage({
        message: {
          role: "user",
          parts: [{ text: executionQuery }],
        },
      });

      // Process the model's response
      await this.processModelResponse(chat, "", true);
    } catch (error) {
      console.error("AGENT: Execution phase error:", error);
      this.addStep("response", "Error in execution phase: " + error.message);
    }
  }

  async processModelResponse(chat, message, isFirstMessage = false) {
    try {
      // Get updated scene information before sending each message
      const currentSceneInfo = this.getSceneInfo();

      // Only for continuation messages, provide updated scene context
      if (!isFirstMessage) {
        // Add context about the current scene state for better positioning
        message = `Current scene state: ${JSON.stringify(
          currentSceneInfo,
          null,
          2
        )}\n\n${message}`;
      }

      // Send the message
      console.log(
        `AGENT: ${isFirstMessage ? "Sending" : "Continuing with"} message:`,
        message
      );

      // Add retry logic for API calls
      let result;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          // Send message using the SDK with the correct format for content
          result = await chat.sendMessage({
            message: {
              role: "user",
              parts: [{ text: message || " " }],
            },
          });
          console.log("AGENT: Raw API response:", result);

          // Check if we have a malformed function call error
          const finishReason = result.candidates?.[0]?.finishReason || "";
          if (finishReason === "MALFORMED_FUNCTION_CALL") {
            console.log(
              "AGENT: Detected malformed function call, retrying with simplified prompt"
            );

            // Simplify the message for retry - keep it generic and based on current scene objects
            if (retryCount === 0) {
              message = `
Looking at the current scene, what is the next part to create according to our plan?
Please provide only one function call at a time.

Current scene objects: ${currentSceneInfo.objectNames.join(", ")}
`;
            } else if (retryCount === 1) {
              // Even more simplified on second retry
              message = `Please continue with the next step in our plan. Use the appropriate function call based on what we need to create next.`;
            } else {
              // After all retries fail, create a fallback response
              console.log("AGENT: All retries failed, using fallback approach");

              // Determine possible next steps based on scene state

              // Check what we have so far to suggest logical next actions
              const existingParts = currentSceneInfo.objectNames;
              if (
                existingParts.includes("Roof Part 1") &&
                !existingParts.includes("Roof Part 2")
              ) {
                // We have a roof part but need the second part
                this.addStep("function", {
                  function: "addObject",
                  params: {
                    type: "box",
                    name: "Roof Part 2",
                    position: { x: 0, y: 3.1, z: 0 },
                    color: "#8B4513", // Brown
                    width: 11,
                    height: 1,
                    depth: 11,
                  },
                });

                await this.executeFunction("addObject", {
                  type: "box",
                  name: "Roof Part 2",
                  position: { x: 0, y: 3.1, z: 0 },
                  color: "#8B4513",
                  width: 11,
                  height: 1,
                  depth: 11,
                });

                this.addStep(
                  "response",
                  "Added the second roof part. Let me position and rotate it correctly."
                );

                // Now set the rotation for the second roof part
                this.addStep("function", {
                  function: "setRotation",
                  params: {
                    object: "Roof Part 2",
                    rotation: { x: 0.785, y: 0, z: 0 },
                  },
                });

                await this.executeFunction("setRotation", {
                  object: "Roof Part 2",
                  rotation: { x: 0.785, y: 0, z: 0 },
                });

                this.addStep(
                  "response",
                  "Completed the roof structure. The house model is now complete!"
                );
                return true;
              } else if (
                !existingParts.some((name) => name.includes("Chimney"))
              ) {
                // Maybe add a chimney
                this.addStep("function", {
                  function: "addObject",
                  params: {
                    type: "box",
                    name: "Chimney",
                    position: { x: 3, y: 4, z: 0 },
                    color: "#A52A2A", // Brown/red brick color
                    width: 1,
                    height: 2,
                    depth: 1,
                  },
                });

                await this.executeFunction("addObject", {
                  type: "box",
                  name: "Chimney",
                  position: { x: 3, y: 4, z: 0 },
                  color: "#A52A2A",
                  width: 1,
                  height: 2,
                  depth: 1,
                });

                this.addStep(
                  "response",
                  "Added a chimney to complete the house structure."
                );
                return true;
              } else {
                // Generic fallback - add a lawn/ground
                this.addStep("function", {
                  function: "addObject",
                  params: {
                    type: "plane",
                    name: "Ground",
                    position: { x: 0, y: 0, z: 0 },
                    color: "#7CFC00", // Lawn green
                    width: 30,
                    height: 30,
                  },
                });

                await this.executeFunction("addObject", {
                  type: "box",
                  name: "Ground",
                  position: { x: 0, y: -0.1, z: 0 },
                  color: "#7CFC00",
                  width: 30,
                  height: 0.2,
                  depth: 30,
                });

                this.addStep(
                  "response",
                  "Added the ground to complete the scene. The house model is now finished!"
                );
                return true;
              }
            }

            retryCount++;
            continue;
          }

          // If we get here, the call was successful
          break;
        } catch (apiError) {
          console.error("AGENT: API error during model response:", apiError);
          if (retryCount >= maxRetries) {
            // After all retries fail, create a fallback response
            console.log(
              "AGENT: All retries failed due to API errors, using fallback approach"
            );

            // Add a simple completion message
            this.addStep(
              "response",
              "I've encountered some issues continuing with the model creation. The basic structure is in place - you can now modify or add to it manually if needed."
            );
            return false;
          }
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
      }

      console.log("AGENT: Raw API response:", JSON.stringify(result, null, 2));

      // Process function calls if any
      const functionCalls = [];

      console.log("AGENT: Checking for function calls in response");

      // Get the response text - FIX: use .text property, not .text() function
      // Access the response text correctly
      let responseText =
        result.text || result.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let hasTextContent = responseText ? true : false;

      // Check for function calls in the response
      const functionCallParts = result.functionCalls || [];
      for (const functionCall of functionCallParts) {
        console.log(
          "AGENT: Found function call:",
          JSON.stringify(functionCall, null, 2)
        );
        functionCalls.push(functionCall);
      }

      // Extract the text response
      console.log("AGENT: Extracted text:", responseText);

      // Process function calls one by one, updating scene context after each call
      if (functionCalls.length > 0) {
        console.log(
          "AGENT: Executing function calls:",
          JSON.stringify(functionCalls, null, 2)
        );

        // Execute each function call sequentially
        for (const functionCall of functionCalls) {
          const functionName = functionCall.name;
          const functionArgs = functionCall.args || {};

          console.log(
            "AGENT: Executing function:",
            functionName,
            "with args:",
            JSON.stringify(functionArgs, null, 2)
          );

          this.addStep("function", {
            function: functionName,
            params: functionArgs,
          });

          // Execute the function and wait for it to complete
          await this.executeFunction(functionName, functionArgs);
        }
      }

      // Display the model's text response
      if (hasTextContent) {
        this.agentSignals.agentResponse.dispatch(responseText);
        this.addStep("response", responseText);
      } else if (!functionCalls.length) {
        // Only show fallback message if we have neither text content nor function calls
        // and this is the first message (not a continuation)
        if (isFirstMessage) {
          const fallbackText = "Processing your request...";
          this.agentSignals.agentResponse.dispatch(fallbackText);
          this.addStep("response", fallbackText);
        }
      }

      // Determine if we should continue the conversation
      const shouldContinue =
        (responseText &&
          (responseText.includes("I'll continue") ||
            responseText.includes("Let me add") ||
            responseText.includes("Next, I'll") ||
            responseText.includes("Now I'll") ||
            responseText.includes("Next step") ||
            responseText.includes("Let's add") ||
            responseText.toLowerCase().includes("next") ||
            responseText.toLowerCase().includes("continue") ||
            responseText.toLowerCase().includes("proceed") ||
            responseText.includes("..."))) ||
        functionCalls.length > 0;

      // Continue the conversation if there's more to do
      if (shouldContinue) {
        console.log("AGENT: More steps needed, continuing execution");

        // Only ask for continuation if we have text or functions were executed
        if (hasTextContent || functionCalls.length > 0) {
          // Only add thinking step if function calls were executed
          if (functionCalls.length > 0) {
            this.addStep("thinking", "Continuing to build...");
          }

          try {
            // Get updated scene info after function execution
            const updatedSceneInfo = this.getSceneInfo();

            // Send continuation message with updated scene context
            const continuationMessage = `
Current scene state: ${JSON.stringify(updatedSceneInfo, null, 2)}

Continue executing the rest of the plan. 

IMPORTANT REMINDERS:
1. Look at what's already been created in the scene
2. Determine the next part to add based on our plan
3. Position new parts correctly relative to existing parts
4. Set proper rotations (in radians or degrees) for each part
5. Ensure parts connect properly and maintain correct proportions

What is the next part to create according to our plan?
`;
            await this.processModelResponse(chat, continuationMessage, false);
          } catch (error) {
            console.error("AGENT: Error continuing execution:", error);
            this.addStep(
              "response",
              "Error while continuing: " + error.message
            );
          }
        }
      } else if (functionCalls.length > 0) {
        // If we executed at least one function but shouldn't continue, show completion
        console.log("AGENT: Execution complete");
        this.agentSignals.agentResponse.dispatch("Creation complete!");
        this.addStep("response", "Creation complete!");
      }

      return true;
    } catch (error) {
      console.error("AGENT: Error processing model response:", error);
      this.addStep("response", "Error processing response: " + error.message);
      return false;
    }
  }

  async executeFunction(functionName, args) {
    try {
      console.log(
        `AGENT: Executing function ${functionName} with args:`,
        JSON.stringify(args, null, 2)
      );

      // Validate args to prevent undefined issues
      args = args || {};

      switch (functionName) {
        case "addObject":
          console.log("AGENT: Calling handleAddObject");
          // Ensure minimal required properties exist
          args.type = args.type || "box";
          args.name =
            args.name ||
            this.generateUniqueObjectName(
              args.type.charAt(0).toUpperCase() + args.type.slice(1)
            );
          args.position = args.position || { x: 0, y: 0, z: 0 };
          args.color = args.color || "#FFFFFF";
          return await this.handleAddObject(args);

        case "setPosition":
          // Ensure we have a position object
          args.position = args.position || { x: 0, y: 0, z: 0 };
          return await this.handleSetPosition(args);

        case "setRotation":
          // Ensure we have a rotation object
          args.rotation = args.rotation || { x: 0, y: 0, z: 0 };
          return await this.handleSetRotation(args);

        case "setScale":
          // Ensure we have a scale object
          args.scale = args.scale || { x: 1, y: 1, z: 1 };
          return await this.handleSetScale(args);

        case "setMaterialColor":
          // Ensure we have a color value
          args.color = args.color || "#FFFFFF";
          return await this.handleSetMaterialColor(args);

        case "setMaterialValue":
          args.value = args.value || "";
          return await this.handleSetMaterialValue(args);

        case "setGeometry":
          return await this.handleSetGeometry(args);

        case "removeObject":
          return await this.handleRemoveObject(args);

        default:
          console.warn(`AGENT: Unknown function: ${functionName}`);
          return { error: `Unknown function: ${functionName}` };
      }
    } catch (error) {
      console.error(`AGENT: Error executing function ${functionName}:`, error);

      // Try to recover instead of just returning an error
      this.addStep(
        "response",
        `I encountered an error with ${functionName}: ${error.message}. Let me try to continue with the next steps.`
      );

      // Return a graceful error object that won't break the flow
      return { error: error.message, recovered: true };
    }
  }

  // Helper method to convert degrees to radians
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Helper method to convert radians to degrees
  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  // Individual function handlers

  async handleAddObject(args) {
    console.log(
      "AGENT: Inside handleAddObject with args:",
      JSON.stringify(args, null, 2)
    );
    const { type, name, position, color, ...geometryParams } = args;
    let object;

    // Convert type to lowercase to handle case variations
    const objectType = (type || "").toLowerCase();
    console.log("AGENT: Creating object of type:", objectType);

    // Create material with the specified color or default
    const material = new MeshStandardMaterial();
    if (color) {
      if (color === "random") {
        material.color.set(this.generateRandomColor());
      } else {
        material.color.set(color);
      }
    }

    // Generate a unique name if not provided
    const objectName =
      name ||
      this.generateUniqueObjectName(
        objectType.charAt(0).toUpperCase() + objectType.slice(1)
      );
    console.log("AGENT: Using object name:", objectName);

    // Create the geometry based on the type
    switch (objectType) {
      case "box":
      case "cube":
        const {
          width = 1,
          height = 1,
          depth = 1,
          widthSegments = 1,
          heightSegments = 1,
          depthSegments = 1,
        } = geometryParams;
        object = new Mesh(
          new BoxGeometry(
            width,
            height,
            depth,
            widthSegments,
            heightSegments,
            depthSegments
          ),
          material
        );
        console.log("AGENT: Created box/cube geometry");
        break;

      case "sphere":
        const {
          radius = 0.5,
          widthSegments: sphereWidthSegments = 32,
          heightSegments: sphereHeightSegments = 16,
        } = geometryParams;
        console.log("AGENT: Creating sphere with params:", {
          radius,
          sphereWidthSegments,
          sphereHeightSegments,
        });
        object = new Mesh(
          new SphereGeometry(radius, sphereWidthSegments, sphereHeightSegments),
          material
        );
        console.log("AGENT: Created sphere geometry");
        break;

      case "cylinder":
        const {
          radiusTop = 0.5,
          radiusBottom = 0.5,
          height: cylinderHeight = 1,
          radialSegments = 32,
          heightSegments: cylinderHeightSegments = 1,
          openEnded = false,
        } = geometryParams;
        object = new Mesh(
          new CylinderGeometry(
            radiusTop,
            radiusBottom,
            cylinderHeight,
            radialSegments,
            cylinderHeightSegments,
            openEnded
          ),
          material
        );
        break;

      case "plane":
        const { width: planeWidth = 1, height: planeHeight = 1 } =
          geometryParams;
        object = new Mesh(new PlaneGeometry(planeWidth, planeHeight), material);
        break;

      case "torus":
        const {
          radius: torusRadius = 0.5,
          tube = 0.2,
          radialSegments: torusRadialSegments = 16,
          tubularSegments = 100,
        } = geometryParams;
        object = new Mesh(
          new TorusGeometry(
            torusRadius,
            tube,
            torusRadialSegments,
            tubularSegments
          ),
          material
        );
        break;

      case "ring":
        const {
          innerRadius = 0.5,
          outerRadius = 1,
          thetaSegments = 32,
        } = geometryParams;
        object = new Mesh(
          new RingGeometry(innerRadius, outerRadius, thetaSegments),
          material
        );
        break;

      case "dodecahedron":
        const { radius: dodecahedronRadius = 1 } = geometryParams;
        object = new Mesh(
          new DodecahedronGeometry(dodecahedronRadius),
          material
        );
        break;

      case "icosahedron":
        const { radius: icosahedronRadius = 1 } = geometryParams;
        object = new Mesh(new IcosahedronGeometry(icosahedronRadius), material);
        break;

      case "tetrahedron":
        const { radius: tetrahedronRadius = 1 } = geometryParams;
        object = new Mesh(new TetrahedronGeometry(tetrahedronRadius), material);
        break;

      case "octahedron":
        const { radius: octahedronRadius = 1 } = geometryParams;
        object = new Mesh(new OctahedronGeometry(octahedronRadius), material);
        break;

      case "circle":
        const { radius: circleRadius = 1, segments = 32 } = geometryParams;
        object = new Mesh(new CircleGeometry(circleRadius, segments), material);
        break;

      case "group":
        object = new Group();
        break;

      case "directionallight":
        const { intensity: directionalIntensity = 1 } = geometryParams;
        object = new DirectionalLight(color || 0xffffff, directionalIntensity);
        break;

      case "pointlight":
        const {
          intensity: pointIntensity = 1,
          distance = 0,
          decay = 2,
        } = geometryParams;
        object = new PointLight(
          color || 0xffffff,
          pointIntensity,
          distance,
          decay
        );
        break;

      case "ambientlight":
        const { intensity: ambientIntensity = 1 } = geometryParams;
        object = new AmbientLight(color || 0xffffff, ambientIntensity);
        break;

      default:
        throw new Error(`Unsupported object type: ${objectType}`);
    }

    // Set object name
    object.name = objectName;

    // Set position if provided
    if (position) {
      object.position.set(position.x || 0, position.y || 0, position.z || 0);
    }

    // Add object to the scene
    const command = new Commands.AddObjectCommand(this.editor, object);
    console.log("AGENT: Executing AddObjectCommand with object:", objectName);
    this.editor.execute(command);
    console.log("AGENT: Command executed successfully");

    // Update the last modified object
    this.lastModifiedObject = object;
    console.log("AGENT: Updated lastModifiedObject:", objectName);

    return { objectName };
  }

  async handleSetPosition(args) {
    const { object: objectName, position } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    if (!position) {
      throw new Error("Position is required");
    }

    // Get current position
    const currentPos = object.position;

    // Create new position vector with existing values for any missing coordinates
    const newPosition = new Vector3(
      position.x !== undefined ? position.x : currentPos.x,
      position.y !== undefined ? position.y : currentPos.y,
      position.z !== undefined ? position.z : currentPos.z
    );

    // Execute command
    const command = new Commands.SetPositionCommand(
      this.editor,
      object,
      newPosition
    );
    this.editor.execute(command);

    return { success: true };
  }

  async handleSetRotation(args) {
    const { object: objectName, rotation } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    if (!rotation) {
      throw new Error("Rotation is required");
    }

    // Get current rotation
    const currentRot = object.rotation;

    // Check if rotation values are likely in degrees (typically larger values)
    // and convert to radians if needed
    let rotX = rotation.x !== undefined ? rotation.x : currentRot.x;
    let rotY = rotation.y !== undefined ? rotation.y : currentRot.y;
    let rotZ = rotation.z !== undefined ? rotation.z : currentRot.z;

    // If values are likely in degrees (typically > 6.28 or < -6.28), convert to radians
    if (Math.abs(rotX) > 6.28) rotX = this.degreesToRadians(rotX);
    if (Math.abs(rotY) > 6.28) rotY = this.degreesToRadians(rotY);
    if (Math.abs(rotZ) > 6.28) rotZ = this.degreesToRadians(rotZ);

    // Create new rotation Euler (not Vector3) and specify 'XYZ' order
    const newRotation = new Euler(rotX, rotY, rotZ, "XYZ");

    // Execute command
    const command = new Commands.SetRotationCommand(
      this.editor,
      object,
      newRotation
    );
    this.editor.execute(command);

    return { success: true };
  }

  async handleSetScale(args) {
    const { object: objectName, scale } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    if (!scale) {
      throw new Error("Scale is required");
    }

    // Create new scale vector
    const newScale = new Vector3(scale.x || 1, scale.y || 1, scale.z || 1);

    // Execute command
    const command = new Commands.SetScaleCommand(this.editor, object, newScale);
    this.editor.execute(command);

    return { success: true };
  }

  async handleSetMaterialColor(args) {
    const { object: objectName, color } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    if (!object.material) {
      throw new Error(`Object ${objectName} does not have a material`);
    }

    if (!color) {
      throw new Error("Color is required");
    }

    // Handle random color
    let colorValue = color;
    if (color === "random") {
      colorValue = this.generateRandomColor();
    }

    // Create color and get hex value
    const threeColor = new Color(colorValue);

    // Execute command
    const command = new Commands.SetMaterialColorCommand(
      this.editor,
      object,
      "color",
      threeColor.getHex()
    );
    this.editor.execute(command);

    return { success: true, color: colorValue };
  }

  async handleSetMaterialValue(args) {
    const { object: objectName, property, value } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    if (!object.material) {
      throw new Error(`Object ${objectName} does not have a material`);
    }

    if (!property) {
      throw new Error("Property is required");
    }

    // Convert string value to appropriate type based on property
    let convertedValue = value;

    // Convert to boolean for these properties
    if (
      ["wireframe", "transparent", "visible", "flatShading"].includes(property)
    ) {
      convertedValue = value === "true" || value === true;
    }
    // Convert to number for these properties
    else if (
      [
        "opacity",
        "metalness",
        "roughness",
        "refractionRatio",
        "aoMapIntensity",
      ].includes(property)
    ) {
      convertedValue = parseFloat(value);
    }

    // Execute command
    const command = new Commands.SetMaterialValueCommand(
      this.editor,
      object,
      property,
      convertedValue
    );
    this.editor.execute(command);

    return { success: true };
  }

  async handleSetGeometry(args) {
    const { object: objectName, ...geometryParams } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    if (!object.geometry) {
      throw new Error(`Object ${objectName} does not have a geometry`);
    }

    let newGeometry;

    // Create appropriate geometry based on the current geometry type
    if (object.geometry instanceof BoxGeometry) {
      const { widthSegments, heightSegments, depthSegments } = geometryParams;
      newGeometry = new BoxGeometry(
        object.geometry.parameters.width,
        object.geometry.parameters.height,
        object.geometry.parameters.depth,
        widthSegments || 1,
        heightSegments || 1,
        depthSegments || 1
      );
    } else if (object.geometry instanceof SphereGeometry) {
      const { widthSegments, heightSegments } = geometryParams;
      newGeometry = new SphereGeometry(
        object.geometry.parameters.radius,
        widthSegments || 32,
        heightSegments || 16
      );
    } else if (object.geometry instanceof CylinderGeometry) {
      const { radialSegments, heightSegments, openEnded } = geometryParams;
      newGeometry = new CylinderGeometry(
        object.geometry.parameters.radiusTop,
        object.geometry.parameters.radiusBottom,
        object.geometry.parameters.height,
        radialSegments || 32,
        heightSegments || 1,
        openEnded !== undefined
          ? openEnded
          : object.geometry.parameters.openEnded
      );
    } else {
      throw new Error(
        `Unsupported geometry type for modification: ${object.geometry.type}`
      );
    }

    // Execute command
    const command = new Commands.SetGeometryCommand(
      this.editor,
      object,
      newGeometry
    );
    this.editor.execute(command);

    return { success: true };
  }

  async handleRemoveObject(args) {
    const { object: objectName } = args;

    // Get the target object
    const object = this.getTargetObject(objectName);
    if (!object) {
      throw new Error(`Object not found: ${objectName}`);
    }

    // Execute command
    const command = new Commands.RemoveObjectCommand(this.editor, object);
    this.editor.execute(command);

    // Clear last modified object if it was the removed object
    if (this.lastModifiedObject === object) {
      this.lastModifiedObject = null;
    }

    return { success: true };
  }

  // Helper method to get target object
  getTargetObject(objectName) {
    if (objectName) {
      const object = this.editor.scene.getObjectByName(objectName);
      if (object) {
        this.lastModifiedObject = object;
        return object;
      }
    }

    return this.lastModifiedObject;
  }

  getFunctionDefinitions() {
    return {
      functionDeclarations: [
        {
          name: "addObject",
          description: "Add a new object to the scene",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description:
                  "Type of object to add: box/cube, sphere, cylinder, plane, torus, ring, dodecahedron, icosahedron, tetrahedron, octahedron, circle, group, directionalLight, pointLight, ambientLight",
              },
              name: {
                type: "string",
                description:
                  "Name for the new object. If not provided, a unique name will be generated.",
              },
              position: {
                type: "object",
                description: "Initial position for the object",
                properties: {
                  x: { type: "number", description: "X coordinate" },
                  y: { type: "number", description: "Y coordinate" },
                  z: { type: "number", description: "Z coordinate" },
                },
              },
              color: {
                type: "string",
                description:
                  "Color for the object material (e.g., 'red', '#ff0000', or 'random')",
              },
              width: {
                type: "number",
                description: "Width for box, plane (default: 1)",
              },
              height: {
                type: "number",
                description: "Height for box, plane, cylinder (default: 1)",
              },
              depth: {
                type: "number",
                description: "Depth for box (default: 1)",
              },
              radius: {
                type: "number",
                description:
                  "Radius for sphere, torus, ring, dodecahedron, etc. (default: 0.5 for sphere, 1 for others)",
              },
              widthSegments: {
                type: "integer",
                description:
                  "Width segments for box, sphere (default: 1 for box, 32 for sphere)",
              },
              heightSegments: {
                type: "integer",
                description:
                  "Height segments for box, sphere (default: 1 for box, 16 for sphere)",
              },
              depthSegments: {
                type: "integer",
                description: "Depth segments for box (default: 1)",
              },
              radiusTop: {
                type: "number",
                description: "Top radius for cylinder (default: 0.5)",
              },
              radiusBottom: {
                type: "number",
                description: "Bottom radius for cylinder (default: 0.5)",
              },
              radialSegments: {
                type: "integer",
                description:
                  "Radial segments for cylinder, torus (default: 32)",
              },
              tube: {
                type: "number",
                description: "Tube radius for torus (default: 0.2)",
              },
              tubularSegments: {
                type: "integer",
                description: "Tubular segments for torus (default: 100)",
              },
              innerRadius: {
                type: "number",
                description: "Inner radius for ring (default: 0.5)",
              },
              outerRadius: {
                type: "number",
                description: "Outer radius for ring (default: 1)",
              },
              thetaSegments: {
                type: "integer",
                description: "Theta segments for ring (default: 32)",
              },
              intensity: {
                type: "number",
                description: "Intensity for lights (default: 1)",
              },
              distance: {
                type: "number",
                description: "Distance for point light (default: 0)",
              },
              decay: {
                type: "number",
                description: "Decay for point light (default: 2)",
              },
              openEnded: {
                type: "boolean",
                description: "Whether cylinder is open-ended (default: false)",
              },
            },
            required: ["type"],
          },
        },
        {
          name: "setPosition",
          description: "Set the position of an object",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object to position. If not provided, uses the last modified object.",
              },
              position: {
                type: "object",
                description:
                  "New position coordinates (omitted coordinates keep current values)",
                properties: {
                  x: { type: "number", description: "X coordinate" },
                  y: { type: "number", description: "Y coordinate" },
                  z: { type: "number", description: "Z coordinate" },
                },
              },
            },
            required: ["position"],
          },
        },
        {
          name: "setRotation",
          description:
            "Set the rotation of an object (can use radians or degrees)",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object to rotate. If not provided, uses the last modified object.",
              },
              rotation: {
                type: "object",
                description:
                  "New rotation values (can be in radians or degrees). Values > 6.28 or < -6.28 are assumed to be degrees and will be converted to radians automatically.",
                properties: {
                  x: {
                    type: "number",
                    description:
                      "Rotation around X axis (pitch - up/down rotation)",
                  },
                  y: {
                    type: "number",
                    description:
                      "Rotation around Y axis (yaw - left/right rotation)",
                  },
                  z: {
                    type: "number",
                    description:
                      "Rotation around Z axis (roll - tilt rotation)",
                  },
                },
              },
            },
            required: ["rotation"],
          },
        },
        {
          name: "setScale",
          description: "Set the scale of an object",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object to scale. If not provided, uses the last modified object.",
              },
              scale: {
                type: "object",
                description:
                  "New scale factors (values > 1 make bigger, < 1 make smaller)",
                properties: {
                  x: {
                    type: "number",
                    description: "Scale factor along X axis",
                  },
                  y: {
                    type: "number",
                    description: "Scale factor along Y axis",
                  },
                  z: {
                    type: "number",
                    description: "Scale factor along Z axis",
                  },
                },
              },
            },
            required: ["scale"],
          },
        },
        {
          name: "setMaterialColor",
          description: "Change object material color",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object. If not provided, uses the last modified object.",
              },
              color: {
                type: "string",
                description:
                  "Color value (e.g., 'red', '#ff0000', or 'random' for a random color)",
              },
            },
            required: ["color"],
          },
        },
        {
          name: "setMaterialValue",
          description: "Set material property value",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object. If not provided, uses the last modified object.",
              },
              property: {
                type: "string",
                description:
                  "Material property to set (e.g., 'wireframe', 'transparent', 'metalness', 'roughness')",
              },
              value: {
                type: "string",
                description:
                  "Value to set for the property (will be converted to appropriate type)",
              },
            },
            required: ["property"],
          },
        },
        {
          name: "setGeometry",
          description: "Modify object geometry detail",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object to modify. If not provided, uses the last modified object.",
              },
              widthSegments: {
                type: "integer",
                description: "Number of segments along width (for box/sphere)",
              },
              heightSegments: {
                type: "integer",
                description: "Number of segments along height (for box/sphere)",
              },
              depthSegments: {
                type: "integer",
                description: "Number of segments along depth (for box only)",
              },
              radialSegments: {
                type: "integer",
                description: "Number of radial segments (for cylinder)",
              },
              openEnded: {
                type: "boolean",
                description: "Whether cylinder is open-ended",
              },
            },
          },
        },
        {
          name: "removeObject",
          description: "Remove an object from the scene",
          parameters: {
            type: "object",
            properties: {
              object: {
                type: "string",
                description:
                  "Name of the object to remove. If not provided, uses the last modified object.",
              },
            },
          },
        },
      ],
    };
  }

  getSystemPrompt(sceneInfo) {
    return `
You are a Three.js scene manipulation assistant embedded in the three.js editor.
Your job is to help users create and modify 3D scenes by interpreting natural language requests.

Current scene information:
${JSON.stringify(sceneInfo, null, 2)}

IMPORTANT GUIDELINES:

PLANNING PHASE:
When asked for a plan, provide a detailed breakdown of:
1. All parts required to create the requested object
2. How the parts relate to each other spatially
3. The sequence for building the object (typically starting with the main body/structure)
4. Specific details like colors, dimensions, and proportions

EXECUTION PHASE:
When executing a plan:
1. Create one part at a time using function calls
2. Set precise positions, scales, and rotations for each part
3. Use meaningful names for each part (e.g., "carBody", "leftWheel", etc.)
4. Follow the plan's sequence exactly

POSITIONING GUIDANCE:
- Use y-axis for height (y=0 is ground level)
- Use x/z axes for horizontal positioning (x: left/right, z: forward/backward)
- Position parts relative to previously created parts
- Use consistent scale throughout the object
- Ensure parts connect properly (avoid gaps or overlaps)

ROTATION GUIDANCE:
- Rotations can be specified in either radians (preferred) or degrees
- For degrees, use values like 90, 180, etc.
- For radians, use values like 1.57 (π/2), 3.14 (π), etc.
- Rotation order is XYZ:
  * First rotates around X-axis (pitch - up/down)
  * Then rotates around Y-axis (yaw - left/right)
  * Finally rotates around Z-axis (roll - tilt)
- Common rotations:
  * To rotate around X: setRotation({x: value, y: 0, z: 0})
  * To rotate around Y: setRotation({x: 0, y: value, z: 0})
  * To rotate around Z: setRotation({x: 0, y: 0, z: value})
- To orient objects like wheels correctly, you may need to rotate them 90 degrees

FUNCTION USAGE:
- Use function calling to manipulate the scene (never return code directly)
- Always specify position parameters when creating objects
- Use color parameters to differentiate parts
- Set appropriate dimensions for each part

COORDINATE SYSTEM INTERPRETATION:
- "above/on top of" = higher y-value
- "below/under" = lower y-value
- "in front of" = higher z-value
- "behind" = lower z-value
- "to the left of" = lower x-value
- "to the right of" = higher x-value

Focus on creating visually coherent 3D objects with properly connected parts.
`;
  }

  getSceneInfo() {
    const scene = this.editor.scene;

    // Get all current objects in the scene
    const objects = [];
    const objectNames = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        const position = child.position.clone();
        const rotation = new Euler().copy(child.rotation);
        const scale = child.scale.clone();

        objects.push({
          name: child.name,
          type: child.geometry.type,
          position: { x: position.x, y: position.y, z: position.z },
          rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
          scale: { x: scale.x, y: scale.y, z: scale.z },
        });

        objectNames.push(child.name);
      }
    });

    return {
      objects,
      objectNames,
    };
  }

  clear() {
    while (this.container.children.length > 0) {
      this.container.remove(this.container.children[0]);
    }
  }
}

export { Agent };
