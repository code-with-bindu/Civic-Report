// @ts-nocheck
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type { Review, CreateReviewBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const getListReviewsUrl = () => `/api/reviews`;

export const listReviews = async (options?: RequestInit): Promise<Review[]> => {
  return customFetch<Review[]>(getListReviewsUrl(), { ...options, method: "GET" });
};

export const getListReviewsQueryKey = () => [`/api/reviews`] as const;

export const getListReviewsQueryOptions = <
  TData = Awaited<ReturnType<typeof listReviews>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof listReviews>>, TError, TData>;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryOptions<Awaited<ReturnType<typeof listReviews>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListReviewsQueryKey();
  return {
    queryKey,
    queryFn: (() => listReviews(requestOptions)) as QueryFunction<Awaited<ReturnType<typeof listReviews>>>,
    ...queryOptions,
  };
};

export const useListReviews = <
  TData = Awaited<ReturnType<typeof listReviews>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof listReviews>>, TError, TData>;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getListReviewsQueryOptions<TData, TError>(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryOptions.queryKey;
  return query;
};

export const createReview = async (
  body: BodyType<CreateReviewBody>,
  options?: SecondParameter<typeof customFetch>,
): Promise<Review> => {
  return customFetch<Review>(`/api/reviews`, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
};

export type CreateReviewMutationResult = NonNullable<Awaited<ReturnType<typeof createReview>>>;
export type CreateReviewMutationBody = BodyType<CreateReviewBody>;
export type CreateReviewMutationError = ErrorType<unknown>;

export const useCreateReview = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createReview>>,
    TError,
    { data: CreateReviewBody },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof createReview>>,
  TError,
  { data: CreateReviewBody },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof createReview>>,
    { data: CreateReviewBody }
  > = ({ data }) => createReview(data, requestOptions);
  return useMutation({ mutationFn, ...mutationOptions });
};
