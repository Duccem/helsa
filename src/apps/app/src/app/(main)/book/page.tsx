import { getSpecialties } from '@/src/actions/doctor/get-specialties';
import DoctorSkeleton from '@/src/components/book/doctor-list-loading';
import DoctorListWrapper from '@/src/components/book/doctor-list-wrapper';
import SearchDoctorInput from '@/src/components/book/search-doctor-input';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { Suspense } from 'react';

const searchParamsCache = createSearchParamsCache({
  q: parseAsString,
  availability: parseAsString,
  minRate: parseAsInteger,
  experience: parseAsInteger,
});

const Page = async (props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => {
  const searchParams = await props.searchParams;
  const { q, experience, availability, minRate } = searchParamsCache.parse(searchParams);
  const filter = {
    experience,
    availability,
    minRate,
  };
  const responseSpecialties = await getSpecialties();
  const specialties = responseSpecialties?.data ?? [];

  const loadingKey = JSON.stringify({
    query: q,
    filter,
  });
  return (
    <div className="grid grid-cols-1 w-full">
      <div className="flex px-5 py-7 w-full">
        <SearchDoctorInput specialties={specialties} />
      </div>
      <Suspense fallback={<DoctorSkeleton />} key={loadingKey}>
        <DoctorListWrapper
          filters={{
            q: q || undefined,
            availability: availability || undefined,
            minRate: minRate || undefined,
            experience: experience || undefined,
          }}
        />
      </Suspense>
    </div>
  );
};

export default Page;
