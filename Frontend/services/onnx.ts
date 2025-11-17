let ort: typeof import('onnxruntime-web') | null = null;
let session: import('onnxruntime-web').InferenceSession | null = null;

export async function ensureOnnx() {
  if (!ort) {
    ort = await import('onnxruntime-web');
  }
  if (!session) {
    session = await ort.InferenceSession.create(
      process.env.NEXT_PUBLIC_ONNX_MODEL_URL || '/models/onnx/placeholder.onnx',
      { executionProviders: ['wasm'] }
    );
  }
  return session;
}

export async function runPrecheck(input: Float32Array) {
  const sess = await ensureOnnx();
  const runtime = ort!;
  const tensor = new runtime.Tensor('float32', input, [1, input.length]);
  const results = await sess.run({ input: tensor });
  return results;
}

