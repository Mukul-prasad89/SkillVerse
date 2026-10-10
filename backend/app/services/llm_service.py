"""LLM provider initialization. Credentials stay server-side (env vars only)."""
import os


class LLMConfigError(RuntimeError):
    """Raised when no usable LLM credentials are configured."""


def get_llm():
    """Return a configured LangChain chat model.

    Env:
      LLM_PROVIDER (default: "openai")
      LLM_MODEL    (default: "gpt-4o-mini")
      LLM_API_KEY  (falls back to OPENAI_API_KEY for the openai provider)
    """
    provider = os.getenv("LLM_PROVIDER", "openai").strip().lower() or "openai"
    if provider == "openai":
        api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
        model = os.getenv("LLM_MODEL", "gpt-4o-mini")
        base_url = os.getenv("LLM_BASE_URL") or None  # e.g. https://openrouter.ai/api/v1
        if not api_key:
            raise LLMConfigError(
                "No LLM credentials configured. Set LLM_API_KEY (or OPENAI_API_KEY) "
                "and optionally LLM_MODEL in the backend environment. "
                "Refusing to return a fabricated roadmap."
            )
        from langchain_openai import ChatOpenAI

        kwargs = {"model": model, "temperature": 0.3, "api_key": api_key}
        if base_url:
            kwargs["base_url"] = base_url
        else:
            kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}
        return ChatOpenAI(**kwargs)
    raise LLMConfigError(
        f"Unsupported LLM_PROVIDER={provider!r}. Supported: 'openai'. "
        "Set LLM_PROVIDER=openai with LLM_API_KEY."
    )


def provider_info() -> dict:
    return {
        "provider": os.getenv("LLM_PROVIDER", "openai"),
        "model": os.getenv("LLM_MODEL", "gpt-4o-mini"),
        "base_url": os.getenv("LLM_BASE_URL") or "https://api.openai.com/v1",
        "configured": bool(os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")),
    }
