# AI Hosting Strategy

## V1 Launch

The production launch uses the existing local RAG pipeline on EC2:

- FAISS index and JSON dataset are downloaded by the backend at startup if missing.
- Sentence Transformers provide embedding and reranking locally.
- The response remains grounded in retrieved medical documents and local health tools.

This avoids Bedrock token spend during the initial free-stage launch.

## Future Bedrock Adapter

If hosted generation is needed later, add a narrow adapter behind the existing response layer rather than replacing retrieval:

```text
query -> local retrieval -> retrieved context -> optional Bedrock generation -> safety/disclaimer -> response
```

Recommended first candidates are low-cost Amazon Nova models available through Amazon Bedrock, such as Nova Micro or Nova Lite, after reviewing current regional availability and pricing.

The adapter should be controlled by backend environment variables:

```text
AI_GENERATION_PROVIDER=local|bedrock
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=<model-id>
```

Keep the default as `local`.
