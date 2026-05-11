import type { SearchInput } from './url-builder/types';

export interface Template {
  id: string;
  title: string;
  description: string;
  search: SearchInput;
  experimental?: boolean;
  /** Section heading in the Templates view. Templates with the same
   *  group are rendered together under a collapsible section. */
  group?: string;
  /**
   * True when the template's URL is intentionally a starter shape that
   * needs the user to customize a hardcoded placeholder value (keyword,
   * author slug, dataset, etc.) before it produces meaningful results.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  // ─── Personal (special URLs — bookmark-shaped, but unavoidable) ───
  {
    id: 'daily-papers',
    title: 'Daily Papers',
    description:
      "Hugging Face's curated daily ML paper digest. Browse what's currently trending in research.",
    group: 'Personal',
    search: {
      type: 'special',
      url: 'https://huggingface.co/papers',
    },
  },
  {
    id: 'my-models',
    title: 'My liked models',
    description:
      'Models you have liked on Hugging Face. Login required.',
    group: 'Personal',
    search: {
      type: 'special',
      url: 'https://huggingface.co/models?sort=likes&direction=-1',
    },
  },

  // ─── Models — discovery ──────────────────────────────────────────
  {
    id: 'trending-llms',
    title: 'Trending LLMs',
    description:
      'Trending text-generation models right now. The pulse of open-source LLMs.',
    group: 'Models',
    search: {
      type: 'models',
      input: {
        pipelineTag: 'text-generation',
        sort: 'trending',
      },
    },
  },
  {
    id: 'top-image-gen',
    title: 'Top image-generation models',
    description:
      'Most-downloaded text-to-image models. Customize the pipeline tag for video or 3D.',
    group: 'Models',
    search: {
      type: 'models',
      input: {
        pipelineTag: 'text-to-image',
        sort: 'downloads',
      },
    },
  },
  {
    id: 'permissive-llms',
    title: 'Permissive-license LLMs',
    description:
      'Apache-2.0 text-generation models — drop-in for commercial use without licensing friction.',
    group: 'Models',
    search: {
      type: 'models',
      input: {
        pipelineTag: 'text-generation',
        license: 'apache-2.0',
        sort: 'trending',
      },
    },
  },
  {
    id: 'recent-models-on-topic',
    title: 'Recently created models on a topic',
    description:
      'Newest model uploads matching a keyword. Customize the keyword (e.g. "coding", "embedding").',
    group: 'Models',
    requiresCustomize: true,
    search: {
      type: 'models',
      input: {
        keywords: 'coding',
        sort: 'created',
      },
    },
  },
  {
    id: 'models-trained-on-dataset',
    title: 'Models trained on a dataset',
    description:
      'Find every model that lists a specific dataset in its training. Customize the dataset slug.',
    group: 'Models',
    requiresCustomize: true,
    search: {
      type: 'models',
      input: {
        dataset: 'wikipedia',
        sort: 'downloads',
      },
    },
  },
  {
    id: 'models-by-author',
    title: 'Models from an author or org',
    description:
      'All public models published by a user or organisation. Customize the author slug (e.g. meta-llama, mistralai).',
    group: 'Models',
    requiresCustomize: true,
    search: {
      type: 'models',
      input: {
        author: 'meta-llama',
        sort: 'trending',
      },
    },
  },
  {
    id: 'gguf-quantized',
    title: 'GGUF quantized models',
    description:
      'Models published with the GGUF library tag — quantized weights ready for llama.cpp / Ollama / LM Studio.',
    group: 'Models',
    search: {
      type: 'models',
      input: {
        library: 'gguf',
        sort: 'trending',
      },
    },
  },

  // ─── Datasets — discovery ────────────────────────────────────────
  {
    id: 'datasets-for-task',
    title: 'Datasets for a task',
    description:
      'Datasets tagged for a specific task category. Customize task (e.g. text-classification, summarization).',
    group: 'Datasets',
    search: {
      type: 'datasets',
      input: {
        taskCategory: 'text-classification',
        sort: 'trending',
      },
    },
  },
  {
    id: 'large-multilingual-datasets',
    title: 'Large multilingual datasets',
    description:
      'Big text corpora across many languages — pretraining-scale (>10M rows) and explicitly multilingual.',
    group: 'Datasets',
    search: {
      type: 'datasets',
      input: {
        sizeCategory: '10M<n<100M',
        multilinguality: 'multilingual',
        sort: 'downloads',
      },
    },
  },
  {
    id: 'image-datasets',
    title: 'Trending image datasets',
    description:
      'Image-modality datasets sorted by trending. Customize the modality for audio/video/tabular.',
    group: 'Datasets',
    search: {
      type: 'datasets',
      input: {
        modality: 'image',
        sort: 'trending',
      },
    },
  },
  {
    id: 'permissive-datasets',
    title: 'Permissive-license datasets',
    description:
      'Datasets with a clear, permissive license (Apache-2.0). Sorted by downloads.',
    group: 'Datasets',
    search: {
      type: 'datasets',
      input: {
        license: 'apache-2.0',
        sort: 'downloads',
      },
    },
  },

  // ─── Spaces — demos & apps ───────────────────────────────────────
  {
    id: 'trending-gradio',
    title: 'Trending Gradio demos',
    description:
      'Live Gradio Spaces with the most momentum right now. The fast-moving "what people are demoing" feed.',
    group: 'Spaces',
    search: {
      type: 'spaces',
      input: {
        sdk: 'gradio',
        sort: 'trending',
      },
    },
  },
  {
    id: 'spaces-for-task',
    title: 'Spaces for a task',
    description:
      'Find live demos by the task they showcase (e.g. text-to-image, image-to-text, ASR).',
    group: 'Spaces',
    search: {
      type: 'spaces',
      input: {
        pipelineTag: 'text-to-image',
        sort: 'trending',
      },
    },
  },
  {
    id: 'spaces-using-model',
    title: 'Spaces using a specific model',
    description:
      'See how a model is being used in production demos. Customize the model slug.',
    group: 'Spaces',
    requiresCustomize: true,
    search: {
      type: 'spaces',
      input: {
        models: 'stabilityai/stable-diffusion-3-medium',
        sort: 'trending',
      },
    },
  },
];
