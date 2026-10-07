"use client";

import { useEffect, useRef, useState } from "react";
import { dataBus } from "@/repositories/core/data-bus";

export interface LiveQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Executa uma consulta assíncrona e a reexecuta sempre que alguma das
 * coleções informadas for alterada (nesta aba ou em outra).
 * Funciona igual para repositórios locais ou remotos.
 */
export function useLiveQuery<T>(
  fetcher: () => Promise<T>,
  collections: string[],
  deps: ReadonlyArray<unknown> = [],
): LiveQueryResult<T> {
  const [state, setState] = useState<LiveQueryResult<T>>({ data: undefined, loading: true, error: null });
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const collectionsKey = collections.join("|");
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let active = true;
    const watched = collectionsKey.split("|");

    const load = () => {
      fetcherRef
        .current()
        .then((data) => {
          if (active) setState({ data, loading: false, error: null });
        })
        .catch((error: unknown) => {
          if (active) setState((s) => ({ ...s, loading: false, error: error instanceof Error ? error : new Error(String(error)) }));
        });
    };

    setState((s) => ({ ...s, loading: s.data === undefined }));
    load();
    const unsubscribe = dataBus.subscribe((collection) => {
      if (watched.includes(collection)) load();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [collectionsKey, depsKey]);

  return state;
}
