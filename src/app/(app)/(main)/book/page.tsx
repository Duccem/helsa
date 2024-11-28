import { getSpecialties } from '@/modules/doctor/presentation/actions/get-specialties';
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server';
import DoctorList from './components/doctor-list';
import SearchDoctorInput from './components/search-doctor-input';

const searchParamsCache = createSearchParamsCache({
  q: parseAsString,
  specialties: parseAsArrayOf(parseAsString),
  availability: parseAsString,
  minRate: parseAsInteger,
  experience: parseAsInteger,
});

const Page = async ({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) => {
  const {
    q,
    experience,
    availability,
    minRate,
    specialties: selectedSpecialties,
  } = searchParamsCache.parse(searchParams);
  const specialties = await getSpecialties();
  return (
    <div className="grid grid-cols-1 w-full">
      <div className="flex px-5 py-7 w-full">
        <SearchDoctorInput specialties={specialties} />
      </div>
      <DoctorList
        filters={{
          q,
          specialties: selectedSpecialties,
          availability,
          minRate,
          experience,
        }}
      />
    </div>
  );
};

export default Page;
