import ImageRow from '@/components/guest/imagerow';
import PageHeader from '@/components/guest/page-header';
import { AreaCard } from '@/components/ui/area-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSmartPoll } from '@/hooks/use-smart-poll';
import Layout from '@/layouts/guest/landing-layout';
import { Auth, PerProgramUnderSurvey } from '@/types';
import { FacultyStaff } from '@/types/content';
import { Head, router, usePage, useRemember } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    ChevronRight,
    Construction,
    Download,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    Image as ImageIcon,
    School,
    Target,
    Users,
} from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';

interface PerProgramProps {
    program: PerProgramUnderSurvey;
}

const useInView = (threshold = 0.1) => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold },
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView] as const;
};

// Fallback Empty State Component
const EmptyState = ({ title, description, icon: Icon = Construction }: { title: string; description: string; icon?: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <Icon className="mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
    </div>
);

// Alert Component for missing critical data
const DataAlert = ({ message }: { message: string }) => (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
            <p className="text-sm font-medium text-amber-900">Content Unavailable</p>
            <p className="mt-1 text-sm text-amber-700">{message}</p>
        </div>
    </div>
);

interface FacultyCardProps {
    faculty: { name: string; photo: string; position: string };
    isLoading: boolean;
    inView: boolean;
    index: number;
}

const FacultyCard = forwardRef<HTMLDivElement, FacultyCardProps>(({ faculty, isLoading, inView }, ref) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    if (isLoading) {
        return (
            <div
                ref={ref}
                className={`group relative w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-500 hover:border-[#7f1414] ${
                    inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
                <div className="flex flex-col space-y-3">
                    <div className="relative">
                        <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-300" />
                    </div>
                    <div className="w-full space-y-2 pt-1">
                        <div className="mx-auto h-5 w-3/4 animate-pulse rounded bg-gray-300" />
                        <div className="mx-auto h-3 w-1/2 animate-pulse rounded bg-gray-300" />
                        <div className="mx-auto h-3 w-2/3 animate-pulse rounded bg-gray-300" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={`group relative w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-500 hover:scale-[1.02] hover:border-[#7f1414] ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
        >
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-[#7f1414] via-[#9a1a1a] to-[#7f1414] opacity-60 transition-opacity duration-300 group-hover:opacity-0" />

            <div className="flex flex-col space-y-3">
                <div className="relative overflow-hidden">
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 ring-2 ring-[#7f1414]/10 transition-all duration-300 group-hover:ring-[#7f1414]/30">
                        {!imgLoaded && <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200" />}
                        <img
                            src={faculty.photo}
                            alt={faculty.name}
                            className={`h-full w-full object-cover transition-all duration-200 group-hover:scale-110 ${
                                imgLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImgLoaded(true)}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    faculty.name,
                                )}&background=7f1414&color=fff&size=400&format=svg`;
                                setImgLoaded(true);
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-1 text-center">
                    <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-[#7f1414]">{faculty.name}</h3>
                    <p className="mt-1 text-xs font-medium text-gray-600">{faculty.position}</p>

                    {/* <div className="border-t border-gray-100 pt-2">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-[#7f1414]/5 px-2.5 py-1.5 text-xs text-gray-600 transition-all duration-200 group-hover:scale-105 hover:bg-[#7f1414] hover:text-white">
                            <span className="max-w-[140px] truncate">Regular Faculty</span>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
});

const FacultyCardWrapper = ({ f, facultyLoading }: { f: FacultyStaff; facultyLoading: boolean }) => {
    const [cardRef, cardInView] = useInView(0.2);
    return (
        <FacultyCard
            ref={cardRef as React.Ref<HTMLDivElement>}
            faculty={{
                name: [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(' '),
                photo:
                    f.image_path ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(f.first_name)}&background=7f1414&color=fff&size=400&format=svg`,
                position: f.program_coordinator ? 'Program Head' : `${f.status} `,
            }}
            isLoading={facultyLoading}
            inView={cardInView}
        />
    );
};

export default function Programs({ program }: PerProgramProps) {
    useSmartPoll(5000);

    const [level, setLevel] = useRemember(program.levels[0]?.level, 'level');
    const [overviewImageLoading, setOverviewImageLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [facultyLoading, setFacultyLoading] = useState(true);
    const { auth } = usePage<Auth>().props;
    const user = auth.user;

    // Animation refs
    const [overviewRef, overviewInView] = useInView(0.2);
    const [objectivesRef, objectivesInView] = useInView(0.1);
    const [galleryRef, galleryInView] = useInView(0.1);
    const [areasRef, areasInView] = useInView(0.1);

    // Check if data exists
    const hasDescription = program?.program_description;
    const hasObjectives = program?.objectives && program.objectives.length > 0;
    const hasFaculty = program?.faculty_staff && program.faculty_staff.length > 0;
    const hasGallery = program?.gallery && program.gallery.length > 0;
    const hasAreas = program?.levels?.[0]?.areas && program.levels[0].areas.length > 0;

    // Simulate faculty loading
    useEffect(() => {
        const timer = setTimeout(() => setFacultyLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleLevelChange = (newLevel: number) => {
        setLevel(newLevel);
        setTimeout(() => {
            router.visit(route('program.show', { id: program.id, level: newLevel }), {
                preserveScroll: true,
                only: ['program'],
            });
        }, 200);
    };

    const campusFacts = [
        { icon: <School className="h-6 w-6" />, label: 'Students', value: program?.student_count || '0' },
        { icon: <Users className="h-6 w-6" />, label: 'Faculty', value: program?.faculty_staff?.length || '0' },
        { icon: <GraduationCap className="h-6 w-6" />, label: 'Years', value: '4' },
    ];

    const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
        <div className="relative mb-12">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7f1414]/5 via-[#7f1414]/10 to-[#7f1414]/5" />
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7f1414] via-[#9a1a1a] to-[#7f1414] px-8 py-10 text-center text-white">
                <div className="relative z-10">
                    <h2 className="mb-3 text-4xl font-bold tracking-tight">{title}</h2>
                    <p className="mx-auto max-w-3xl text-lg leading-relaxed font-medium opacity-90">{subtitle}</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title={`${program.degree_type} in ${program.program_name}`} />
            <Layout className="flex flex-col items-center justify-center">
                <PageHeader
                    className="hidden lg:block"
                    title=""
                    quickLinks={[
                        { label: 'Overview', targetId: 'overview' },
                        { label: 'Objectives', targetId: 'goals' },
                        { label: 'Faculty', targetId: 'faculty' },
                        { label: 'Areas', targetId: 'areas' },
                    ]}
                    breadcrumbs={[
                        { label: 'Home', href: '/' },
                        { label: 'Programs', href: '/programs' },
                        { label: `${program.program_name} • Level ${program.levels[0]?.level}`, href: `/programs/${program.program_id}` },
                    ]}
                />

                {/* --- Enhanced Header Banner --- */}
                <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#7f1414] via-[#9a1a1a] to-[#b52020]">
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>

                    {/* Image Overlay */}
                    <div className="absolute top-0 right-0 h-full w-2/3 opacity-40">
                        <div className="relative h-full w-full">
                            <img
                                src={program.program_image_path || '/images/homepage-slides/1.jpg'}
                                alt="Program Background"
                                className="h-full w-full object-cover"
                                style={{
                                    maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                                }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const container = target.parentElement?.parentElement;
                                    if (container) container.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div className="relative z-10 mx-auto flex w-[80%] max-w-5xl flex-col items-center justify-between gap-10 px-8 py-16 md:flex-row">
                        <div className="animate-fade-in-up flex flex-col items-start text-white">
                            <div className="mb-4">
                                <span className="inline-block items-center gap-1.5 rounded-md bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-[#7f1414] uppercase">
                                    {program.degree_type}
                                </span>
                            </div>

                            <h1 className="mb-6 text-left text-4xl font-bold">{program.program_name}</h1>

                            {/* Dropdown */}
                            <div className="group/dropdown relative" onMouseLeave={() => setDropdownOpen(false)}>
                                {program.levels.length > 1 ? (
                                    <div className="relative">
                                        <div
                                            onMouseEnter={() => setDropdownOpen(true)}
                                            className="flex w-60 cursor-pointer items-center justify-between rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white backdrop-blur-md transition-all duration-300 group-hover/dropdown:w-96 hover:bg-white/20"
                                        >
                                            <span className="text-xs font-medium whitespace-nowrap">Accreditation Level {level}</span>
                                            <ChevronRight
                                                className={`h-5 w-5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>

                                        <div
                                            className={`absolute top-0 left-48 h-full overflow-hidden rounded-r-xl border-t border-r border-b border-white/30 backdrop-blur-md transition-all duration-300 ${
                                                dropdownOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
                                            }`}
                                        >
                                            <div className="flex h-full bg-white/10">
                                                {program.levels.map((lvlObj) => (
                                                    <button
                                                        key={lvlObj.level}
                                                        onClick={() => handleLevelChange(lvlObj.level)}
                                                        className={`flex-1 border-r border-white/20 px-3 py-3 text-sm text-white transition-all duration-200 last:border-r-0 hover:bg-[#7f1414]/30 ${
                                                            level === lvlObj.level ? 'bg-[#7f1414]/20 font-semibold' : ''
                                                        }`}
                                                    >
                                                        {lvlObj.level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="w-60 items-center justify-between rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-medium text-white text-white/80 backdrop-blur-md transition-all duration-300 hover:bg-white/20">
                                        Accreditation Level {program.levels[0]?.level}
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Campus Facts */}
                        <div className="animate-fade-in-left flex flex-col gap-4 text-white/90">
                            {campusFacts.map((fact, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 rounded-xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-xs transition-all duration-300 hover:border-white/40 hover:bg-white/20"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20">
                                        {fact.icon}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">{fact.value}</div>
                                        <div className="text-sm opacity-80">{fact.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mb-10 flex w-full max-w-5xl flex-col items-center gap-20">
                    {/* --- Overview --- */}
                    <div
                        ref={overviewRef}
                        id="overview"
                        className={`mt-16 w-[82%] transition-all duration-700 ${
                            overviewInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                        }`}
                    >
                        {!hasDescription ? (
                            <DataAlert message="Program overview is currently being updated. Please check back later." />
                        ) : (
                            <div className="relative overflow-hidden rounded-xl">
                                <div className="border-black-90 grid grid-cols-1 rounded-xl border-1 transition-all duration-300 hover:border-[#7f1414] lg:grid-cols-5">
                                    {/* Text Content */}
                                    <div className="col-span-3 flex flex-col justify-center rounded-l-xl p-12 lg:p-20">
                                        <div className="mb-3 inline-block w-fit rounded-full bg-[#7f1414] px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase">
                                            About the Program
                                        </div>
                                        <h2 className="mb-6 text-lg font-bold text-gray-900 lg:text-4xl">Program Overview</h2>
                                        <p className="text-md leading-relaxed text-gray-700">{program.program_description}</p>
                                    </div>

                                    {/* Image */}
                                    <div className="relative col-span-2 h-[300px] lg:h-auto">
                                        {overviewImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                                <div className="h-12 w-12 animate-spin rounded-full" />
                                            </div>
                                        )}
                                        {program.program_image_path ? (
                                            <img
                                                src={program.program_image_path}
                                                alt={program.program_image_name || 'Program Overview Image'}
                                                className={`h-full w-full object-cover transition-all duration-700 ${
                                                    !overviewImageLoading ? 'opacity-100' : 'opacity-0'
                                                }`}
                                                onLoad={() => setOverviewImageLoading(false)}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                <ImageIcon className="h-16 w-16 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Objectives Section */}
                    <div ref={objectivesRef} className="w-[85%] max-w-7xl" id="goals">
                        <div className={`transition-all duration-200 ${objectivesInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                            <SectionHeader title="Program Objectives" subtitle="Our commitment to excellence through strategic goals and outcomes" />
                        </div>

                        {!hasObjectives ? (
                            <EmptyState
                                title="Program Objectives Coming Soon"
                                description="The program objectives are being finalized and will be available here shortly."
                                icon={Target}
                            />
                        ) : (
                            <div className="flex flex-wrap justify-center gap-8">
                                {program.objectives.map((objective) => (
                                    <div
                                        key={objective.program_objective_id}
                                        className={`border-black-90 group relative flex w-full max-w-2xs flex-col justify-start gap-4 overflow-hidden rounded-2xl border-1 p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:border-[#7f1414] ${
                                            objectivesInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                                        }`}
                                    >
                                        {/* Objective Header */}
                                        <div className="relative">
                                            <div className="mb-2 inline-block rounded-full bg-gradient-to-r from-[#7f1414] to-[#a11d1d] px-6 py-2 transition-all duration-300">
                                                <h3 className="text-sm font-bold tracking-wider text-white uppercase">{objective.objective_title}</h3>
                                            </div>
                                        </div>

                                        {/* Objective Content */}
                                        <p className="relative grid place-items-center leading-relaxed text-gray-700 transition-all duration-300 group-hover:text-gray-900">
                                            {objective.objective_description}
                                        </p>

                                        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#7f1414] via-[#a11d1d] to-[#7f1414] transition-all duration-300 group-hover:h-2"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- Faculty Section --- */}
                    <div className="mx-auto w-[85%] max-w-7xl" id="faculty">
                        <SectionHeader title="Our Faculty" subtitle="Meet our dedicated educators who shape the future of technology" />
                        {!hasFaculty && !facultyLoading ? (
                            <EmptyState
                                title="Faculty Information Coming Soon"
                                description="Faculty profiles are being compiled and will be displayed here shortly."
                                icon={Users}
                            />
                        ) : (
                            <div className="flex flex-wrap justify-center gap-6">
                                {program.faculty_staff?.map((f) => (
                                    <FacultyCardWrapper key={f.faculty_staff_id} f={f} facultyLoading={facultyLoading} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- Gallery --- */}
                    <div ref={galleryRef} className="w-[85%] max-w-7xl" id="gallery">
                        <div className={`transition-all duration-700 ${galleryInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                            <SectionHeader title="Gallery of Excellence" subtitle="Showcasing the moments that define our passion and commitment" />

                            {!hasGallery ? (
                                <EmptyState
                                    title="Gallery Coming Soon"
                                    description="Program gallery images are being curated and will be available here shortly."
                                    icon={ImageIcon}
                                />
                            ) : (
                                <ImageRow
                                    height="h-96"
                                    images={program.gallery.map((item) => ({
                                        id: item.program_gallery_id,
                                        src: item.image_path,
                                        alt: item.image_name,
                                    }))}
                                />
                            )}
                        </div>
                    </div>

                    {/* --- Areas Under Survey --- */}
                    <div ref={areasRef} className="w-[85%] max-w-7xl" id="areas">
                        <div
                            className={`relative transition-all duration-700 ${areasInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                        >
                            <SectionHeader
                                title="Areas Under Survey"
                                subtitle="ACCREDITING AGENCY OF CHARTERED COLLEGES AND UNIVERSITIES IN THE PHILIPPINES"
                            />
                            {user?.roles?.role_name === 'Accreditor' && hasAreas && (
                                <div className="w-full text-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="noborder">
                                                Program Mean: N/A
                                                <Download className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Export All Area Means</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                                Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="mr-2 h-4 w-4 text-red-600" />
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            <div className="flex flex-wrap justify-center gap-8 py-6">
                                {!hasAreas ? (
                                    <EmptyState
                                        title="No Areas Under Survey"
                                        description="Survey areas for this program will be added once the accreditation process begins."
                                        icon={BookOpen}
                                    />
                                ) : (
                                    program.levels[0].areas
                                        .slice()
                                        .sort((a, b) => (Number(a.area_number) || 0) - (Number(b.area_number) || 0))
                                        .map((area) => (
                                            <div
                                                key={area.area_id}
                                                className={`transition-all duration-500 ${
                                                    areasInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                                                }`}
                                            >
                                                <AreaCard
                                                    imageSrc={area.area_image_path ?? '/images/placeholder.png'}
                                                    heading={area.area_name}
                                                    circleLetter={area.area_numeral}
                                                    href={route('programs.areas.show', [program.program_id, area.area_id])}
                                                />
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
