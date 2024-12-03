import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { useEffect, useState } from "react"
import Loader from "../../Loader"

const EditPostModal = ({handleCloseEvent, postId, categoriesList, refreshWordPressPosts}) => {

    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [editorContent, setEditorContent] = useState("")
    const [featuredImage, setFeaturedImage] = useState("")
    const [status, setStatus] = useState("")
    const [displayLoader, setDisplayLoader] = useState(false)
    const [defaultFeaturedImageURL, setDefaultFeaturedImageURL] = useState("http://localhost/spa-app/wp-app/wp-content/uploads/2024/10/no-image.jpg")

    // To get existing information by post ID
    useEffect( () => {
        fetchSingleWordPressPostData(postId)
    }, [postId])

    const fetchSingleWordPressPostData = async(postId) => {
        setDisplayLoader(true)
        try{

            const apiResponse = await fetch(`http://localhost/spa-app/wp-app/wp-json/wp/v2/posts/${postId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin")
                }
            });

            const apiData = await apiResponse.json()

            // Set State Variables
            setTitle(apiData.title.rendered)
            setCategory(apiData.categories[0])
            setEditorContent(apiData.content.rendered)
            setStatus(apiData.status)
            
            console.log(apiData)
            
            // Media ID
            let featuredImagedMediaId = apiData.featured_media;
            if(featuredImagedMediaId > 0){
                fetchWordPressPostMediaURL(featuredImagedMediaId)
            } else{
                setDefaultFeaturedImageURL("http://localhost/spa-app/wp-app/wp-content/uploads/2024/10/no-image.jpg")
            }
        } catch(error){
            console.log(error);
            
        } finally{
            setDisplayLoader(false)
        }
    }

    // Get Media URL
    const fetchWordPressPostMediaURL = async(mediaID) => {
        setDisplayLoader(true)
        try{
            const apiResponse = await fetch(`http://localhost/spa-app/wp-app/wp-json/wp/v2/media/${mediaID}`, {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin")
                }
            })

            const apiData = await apiResponse.json()

            console.log(apiData);
            // Image URL
            setDefaultFeaturedImageURL(apiData.source_url)
        } catch(error){
            console.log(error)
        } finally{
            setDisplayLoader(false)
        }
    }

    // Handle Form Submit
    const handleFormSubmitData = async(event) => {

        event.preventDefault();

        const postData = {
            title,
            content: editorContent,
            categories: [category],
            status
        }

        // Upload Featured Image - If we upload
        let featuredMediaId = null;
        if(featuredImage){
            featuredMediaId = await uploadNewFeaturedMediaImage(featuredImage)
            postData.featured_media = featuredMediaId
        }

        setDisplayLoader(true)
        try{

            const apiResponse = await fetch(`http://localhost/spa-app/wp-app/wp-json/wp/v2/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"),
                    "Content-type": "application/json"
                },
                body: JSON.stringify(postData)
            })

            const apiData = await apiResponse.json();

            console.log(apiData);

            handleCloseEvent();
            refreshWordPressPosts();
            
        } catch(error){
            console.log(error);
        } finally{
            setDisplayLoader(false)
        }
    }

    // Upload Featured MEdia
    const uploadNewFeaturedMediaImage = async(featuredImage) => {

        setDisplayLoader(true)
        try{

            const formdata = new FormData();
            formdata.append("file", featuredImage);
            formdata.append("alt_text", "New Featured Image");

            const apiResponse = await fetch("http://localhost/spa-app/wp-app/wp-json/wp/v2/media", {
                method: "POST",
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin")
                },
                body: formdata
            })

            const apiData = await apiResponse.json()

            return apiData.id
        } catch(error){
            console.log(error);
        } finally{
            setDisplayLoader(false)
        }
    }

    return <>
        <div className="modal" id="editPostModal">
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
                { displayLoader && <Loader /> }
                <h2 className="text-2xl mb-4">Edit Post</h2>
                <form onSubmit={ handleFormSubmitData }>
                    <div className="mb-4 flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                        type="text"
                        className="border border-gray-300 rounded w-full p-2"
                        value={title}
                        onChange={ (e) => setTitle(e.target.value) }
                        required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                        value={category}
                        onChange={ (e) => setCategory(e.target.value) }
                        className="border border-gray-300 rounded w-full p-2"
                        required
                        >
                        <option value="">Select Category</option>
                        {
                            Object.entries(categoriesList).map( ([index, value]) => (
                                <option value={index} key={index}>{value}</option>
                            ))
                        }
                        </select>
                    </div>
                    </div>
            
                    <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Content</label>
                      <CKEditor editor={ClassicEditor} data={editorContent} onChange={ (e, editor) => {
                        const editorData = editor.getData()
                        setEditorContent(editorData)
                      }} />
                    </div>
            
                    <div className="mb-4 flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Featured Image</label>
                        <input
                        type="file"
                        onChange={ (e) => setFeaturedImage(e.target.files[0]) }
                        />
                        <br /><br />
                        <img src={defaultFeaturedImageURL} style={{
                            height: "100px"
                        }} alt="Featured" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                        value={status}
                        onChange={ (e) => setStatus(e.target.value) }
                        className="border border-gray-300 rounded w-full p-2"
                        required
                        >
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                        </select>
                    </div>
                    </div>
            
                    <div className="flex justify-end">
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                        onClick={handleCloseEvent}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Update
                    </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    </>
}

export default EditPostModal