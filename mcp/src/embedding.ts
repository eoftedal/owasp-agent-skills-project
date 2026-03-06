import { pipeline, Tensor } from "@huggingface/transformers";
import { writeFile, readFile } from "fs/promises";

const extractor = await pipeline("feature-extraction", "onnx-community/Qwen3-Embedding-0.6B-ONNX", {
    // optional pipeline-level options; some models benefit from specifying dtype or quantization
  device: "auto",
  dtype: "fp32"
}); 

export async function embed(text: string): Promise<Tensor> {

  // Provide embedding options
  const output = await extractor(text, {
    pooling: "last_token",
    normalize: true,
  });
  return output;
}


export async function saveTensor(t: Tensor, path: string) {
  const obj = {
    dims: t.dims,
    dtype: t.type, // e.g. "float32"
    data: Array.from(t.data as Float32Array),
  };
  await writeFile(path, JSON.stringify(obj));
}

export async function loadTensor(path: string): Promise<Tensor> {
  const { dims, dtype, data } = JSON.parse(await readFile(path, "utf8"));
  // Import the Tensor constructor
  return new Tensor(dtype, new Float32Array(data), dims);
}