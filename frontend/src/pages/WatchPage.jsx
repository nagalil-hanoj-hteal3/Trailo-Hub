import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContentStore } from "../store/content";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPlayer from "react-player";
import { ORIGINAL_IMG_BASE_URL, SMALL_IMG_BASE_URL } from "../utils/constants";
import { formatReleaseDate } from "../utils/dateFunction";
import WatchPageSkeleton from "../components/skeletons/WatchPageSkeleton";

export const WatchPage = () => {
    const {id} = useParams();
    // console.log(id);
    const [trailers, setTrailers] = useState([]);
    const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState(null);
    const [similarContent, setSimilarContent] = useState([]);
    const {contentType} = useContentStore();
    const sliderRef = useRef(null);

    // added
    const [reviewContent, setReviewContent] = useState({ results: []});
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    // console.log(reviewContent.length);

    // trailers of the movie or tv show
    useEffect(() => {
        const getTrailers = async () => {
            try {
                const res = await axios.get(`/api/v1/content/${contentType}/${id}/trailers`);
                // console.log("Full content response:", res.data.content);
                setTrailers(res.data.trailers);
            } catch (error) {
                if(error.message.includes("404")) {
                    console.log("No trailers found...empty");
                    setTrailers([]);
                }
            }            
        };
        getTrailers();
    }, [contentType, id]);

    // similar of the movie or tv show
    useEffect(() => {
        const getSimilarContent = async () => {
            try {
                const res = await axios.get(`/api/v1/content/${contentType}/${id}/similar`);
                setSimilarContent(res.data.similar);
            } catch (error) {
                if(error.message.includes("404")) {
                    console.log("No trailers found...empty");
                    setSimilarContent([]);
                }
            }            
        };
        getSimilarContent();
    }, [contentType, id]);

    // details of the movie or tv show
    useEffect(() => {
        const getContentDetails = async () => {
            try {
                const res = await axios.get(`/api/v1/content/${contentType}/${id}/details`);
                setContent(res.data.content);
            } catch (error) {
                if(error.message.includes("404")) {
                    // console.log("No trailers found...empty");
                    setContent(null);
                }
            }  finally {
                setLoading(false);
            }         
        };
        getContentDetails();
    }, [contentType, id]);

    // work in progress for the review portion
    useEffect(() => {
        const getContentReview = async () => {
            try {
                const res = await axios.get(`/api/v1/content/${contentType}/${id}/reviews`);
                console.log("review: ", res.data.review);
                setReviewContent(res.data.review);
            } catch (error) {
                if (error.message.includes("404")) {
                    setReviewContent({results: []});
                }
            }
        };

        getContentReview();
    }, [contentType, id]);

    // console.log("trailers: ", trailers);  // Pretty-prints trailers
    // console.log("similar content: ", similarContent);  // Pretty-prints similar content
    // console.log("content details: ", content);

    const handleNext = () => {
        if(currentTrailerIdx < trailers.length - 1)
            setCurrentTrailerIdx(currentTrailerIdx +1);
    }

    const handlePrev = () => {
        if(currentTrailerIdx > 0)
            setCurrentTrailerIdx(currentTrailerIdx -1);
    }

    const scrollLeft = () => {
        if(sliderRef.current) sliderRef.current.scrollBy({
            left: -sliderRef.current.offsetWidth, behavior: "smooth"
        });
    }

    const scrollRight = () => {
        if(sliderRef.current) sliderRef.current.scrollBy({
            left: sliderRef.current.offsetWidth, behavior: "smooth"
        });
    }

    if(loading) return (
        <div className="min-h-screen bg-black p-10">
            <WatchPageSkeleton/>
        </div>
    )

    // added
    const toggleContent = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const goToNextReview = () => {
        if(currentReviewIndex < reviewContent.total_results - 1)
            setCurrentReviewIndex(currentReviewIndex + 1);
        else
            setCurrentReviewIndex(0);
    };

    const goToPrevReview = () => {
        if (currentReviewIndex > 0)
            setCurrentReviewIndex(currentReviewIndex -1);
        else
            setCurrentReviewIndex(reviewContent.total_results - 1);
    };

    console.log("review content: " + reviewContent.total_results);
    console.log("review content 1: ", reviewContent.results[1]);

    return (
        // <Navbar/>
        <div className="bg-black min-h-screen text-white">
            <div className="mx-auto container px-4 py-8 h-full">
                <Navbar/>

                {trailers.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <button className={
                        `bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${currentTrailerIdx === 0 ?
                        "cursor-not-allowed opacity-50": ""}
                        `}
                        disabled={currentTrailerIdx === 0}>
                        <ChevronLeft size={24}
                            onClick={handlePrev}
                        />
                     </button>

                     <button className={
                        `bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${currentTrailerIdx === trailers.length-1 ?
                        "cursor-not-allowed opacity-50": ""}
                        `}
                        disabled={currentTrailerIdx === trailers.length-1}>
                        <ChevronRight size={24}
                            onClick={handleNext}
                        />
                     </button>
                </div>)}
                
                {/* video display */}
                <div className="aspect-video mb-8 p-2 sm:px-10 md:px-32">
                    
                    {/* display trailers about the movie/tv show */}
                    {trailers.length > 0 ? (
                        <ReactPlayer
                            controls={true}
                            width={"100%"}
                            height={"70vh"}
                            className="mx-auto overflow-hidden rounded-lg"
                            url={`https://www.youtube.com/watch?v=${trailers[currentTrailerIdx].key}`}
                        />
                    ) : (
                        <div className="text-center mt-5">
                            <img
                                src="/404.png"  // Path to your fallback image
                                alt="No trailers available"
                                className="mx-auto max-w-full h-auto rounded-lg"
                            />
                            <h2 className="text-xl mt-3">
                                Sorry, we currently do not have trailers of{" "}
                                <span className="font-bold text-red-600">
                                    {content?.title || content?.name}
                                </span> at this time 😥
                            </h2>
                        </div>
                    )}

                </div>

                {/* movie details */}

                <div className="flex flex-col md:flex-row items-center justify-between gap-20 max-w-6xl mx-auto">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-5xl font-bold text-balance">{content?.title || content?.name}</h2>
                        <p className="mt-2 text-lg">Released:{" "}
                            {formatReleaseDate(content?.release_date || content?.first_air_date)} |{" "}
                            {content?.adult ? (
                                <span className="text-red-600">18+</span>
                            ) : (
                                <span className="text-green-600">PG-13</span>
                            )}{" "}
                        </p>
                        <p className="mt-4 text-lg">{content?.overview}</p>
                                            
                    </div>

                    <img
						src={content?.poster_path ? ORIGINAL_IMG_BASE_URL + content.poster_path : '/unavailable.jpg'}
                        alt="Poster image"
                        className="max-h-[600px] rounded-md"
					/>
                </div>
                
                {/* similar portion */}
                {similarContent.length > 0 && (
                    <div className="mt-12 max-w-5xl mx-auto relative">
                        <h3 className="text-4xl font-bold mb-4">
                            Similar Movies/TV show
                        </h3>

                        <div className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group"
                        ref={sliderRef}>
                            {similarContent.map((content) => (
                                <Link key={content.id} to={`/watch/${content.id}`}
                                    className="w-52 flex-none hover:text-red-300">
                                    <img src={content.poster_path ? SMALL_IMG_BASE_URL + content.poster_path : "/unavailable.jpg"} // Fallback image
                                        alt="Similar Poster path"
                                        className="w-full h-auto transition-transform duration-300 ease-in-out hover:scale-105"/>
                                    <h4 className="mt-2 text-lg font-semibold">
                                        {content.title || content.name}
                                    </h4>
                                </Link>
                            ))}

                            <ChevronRight
                                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8
                                opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer
                                bg-red-600 text-white rounded-full
                                " onClick={scrollRight}
                            />

                            <ChevronLeft
                                className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 opacity-0
                                group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full"
                                onClick={scrollLeft}
                            />

                        </div>
                    </div>
                )}

                {/*Reviews portion*/}

                <div className="mt-12 max-w-5xl mx-auto relative">
                    <h2 className="text-4xl font-bold mb-8">Reviews</h2>
                    {reviewContent.results.length === 0 ? (
                        <p className="mt-4 text-rose-200 ">No reviews available at this time.</p>
                    ) : (
                        // to display reviews per person
                        <div className="flex items-center justify-between w-full">
                            {/* Left Chevron */}
                            <ChevronLeft
                                onClick={goToPrevReview}
                                className="w-8 h-8 cursor-pointer bg-red-600 text-white rounded-full flex-shrink-0"
                            />

                            {/* Current Review */}
                            <div ref={sliderRef} className="max-w-3xl">
                                <h3 className="text-2xl font-bold mb-4 hover:underline">
                                    {reviewContent.results[currentReviewIndex].author}
                                </h3>
                                <p className="text-lg">
                                    {expandedIndex === currentReviewIndex || reviewContent.results[currentReviewIndex].content.length <= 300
                                        ? reviewContent.results[currentReviewIndex].content
                                        : `${reviewContent.results[currentReviewIndex].content.slice(0, 300)}...`}
                                    {reviewContent.results[currentReviewIndex].content.length > 300 && (
                                        <button onClick={() => toggleContent(currentReviewIndex)} className="text-white hover:text-blue-600">
                                            {expandedIndex === currentReviewIndex ? `\u00A0See less` : `\u00A0See more`}
                                        </button>
                                    )}
                                </p>
                                <p className="mt-4 text-rose-200 text-sm">
                                    {new Date(reviewContent.results[currentReviewIndex].created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Right Chevron */}
                            <ChevronRight
                                onClick={goToNextReview}
                                className="w-8 h-8 cursor-pointer bg-red-600 text-white rounded-full flex-shrink-0"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WatchPage;