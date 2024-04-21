import * as fs from 'fs';
import { makeDiff } from '../src/lib/diff'; // makeDiff関数をインポート

// ダミーのJSONオブジェクトを生成
const originalObject = {
  id: 1,
  name: "Example Object",
  description: "This is a sample object to demonstrate a structure with approximately 2KB size and up to 3 levels of nesting.",
  details: {
    createdAt: "2023-04-01T12:00:00Z",
    updatedAt: "2023-04-01T12:00:00Z",
    metadata: {
      author: "GitHub Copilot",
      version: "1.0",
      tags: ["sample", "data", "test"]
    },
    history: [
      { date: "2023-03-31T11:00:00Z", action: "created" },
      { date: "2023-04-01T12:00:00Z", action: "updated" }
    ]
  },
  components: [
    {
      id: 101,
      type: "componentA",
      properties: {
        color: "red",
        size: "medium",
        description: "Component A is designed for demonstration purposes."
      }
    },
    {
      id: 102,
      type: "componentB",
      properties: {
        color: "blue",
        size: "small",
        description: "Component B is a complementary component to A, also for demonstration."
      }
    }
  ],
  relatedObjects: [
    { id: 2, relationType: "sibling" },
    { id: 3, relationType: "child" }
  ]
};

const updatedObject = {
  id: 1,
  name: "Example Object",
  description: "This object has been modified to demonstrate changes for diff operation.",
  details: {
    createdAt: "2023-04-01T12:00:00Z",
    updatedAt: "2023-04-02T12:00:00Z", // Updated date
    metadata: {
      author: "GitHub Copilot",
      version: "1.1", // Updated version
      tags: ["sample", "data", "test", "updated"], // Added new tag
      category: "demonstration" // New property
    },
    history: [
      { date: "2023-03-31T11:00:00Z", action: "created" },
      { date: "2023-04-01T12:00:00Z", action: "updated" },
      { date: "2023-04-02T12:00:00Z", action: "modified" } // New history entry
    ]
  },
  components: [
    {
      id: 101,
      type: "componentA",
      properties: {
        color: "red",
        size: "medium",
        description: "Component A is designed for demonstration purposes."
      }
    },
    {
      id: 102,
      type: "componentB",
      properties: {
        color: "blue",
        size: "small",
        description: "Component B is a complementary component to A, also for demonstration."
      }
    },
    {
      id: 103, // New component
      type: "componentC",
      properties: {
        color: "green",
        size: "large",
        description: "Component C is an additional component for extended demonstration."
      }
    }
  ],
  relatedObjects: [
    { id: 2, relationType: "sibling" },
    { id: 3, relationType: "parent" } // Changed relationType
  ]
};

// 差分を計算し、結果をJSONL形式でファイルに保存する関数
function saveDiffAsJsonl(originalObject: any, updatedObject: any, filePath: string) {
    const differences = makeDiff(originalObject, updatedObject); // 差分を計算
    const stream = fs.createWriteStream(filePath, { flags: 'w' });
    differences.forEach(difference => {
        stream.write(JSON.stringify(difference) + '\n'); // 差分をJSONL形式で書き込み
    });
    stream.end();
}

// 差分を計算してJSONL形式で保存
saveDiffAsJsonl(originalObject, updatedObject, './example/diff.jsonl');