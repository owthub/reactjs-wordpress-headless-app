
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { useState } from "react"
import Loader from "../../Loader"

const AddPostModal = ({handleCloseEvent, categoriesList, refreshWordPressPosts}) => {

    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [editorContent, setEditorContent] = useState("")
    const [featuredImage, setFeaturedImage] = useState(null)
    const [status, setStatus] = useState("")
    const [displayLoader, setDisplayLoader] = useState(false)

    //console.log(categoriesList);
    

    // Handle Form Submit
    const handleFormSubmitData = async(event) => {

        event.preventDefault();

        setDisplayLoader(true)

        let featuredImageID = null;
        // Upload Media to WordPress and also get back media ID
        if(featuredImage){
            featuredImageID = await handleFeaturedImageUpload(featuredImage)
        }

        const postData = {
            title,
            content: editorContent,
            categories: [category],
            featured_media: featuredImageID,
            status
        }

        console.log(postData);

        try{

            const apiResponse = await fetch("http://localhost/spa-app/wp-app/wp-json/wp/v2/posts", {
                method: "POST",
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"),
                    "Content-type": "application/json"
                },
                body: JSON.stringify(postData)
            })

            const apiData = await apiResponse.json();

            handleCloseEvent();
            refreshWordPressPosts();
        } catch(error){
            console.log(error)
        } finally {
            setDisplayLoader(false)
        }
    }

    // Upload featured Image
    const handleFeaturedImageUpload = async(featuredImageFile) => {

        try{

            const formdata = new FormData();

            formdata.append("file", featuredImageFile);
            formdata.append("alt_text", "Featured Image of Post")

            const apiResponse = await fetch("http://localhost/spa-app/wp-app/wp-json/wp/v2/media", {
                method: "POST",
                headers:{
                    "Authorization": "Basic " + btoa("admin:admin")
                },
                body: formdata
            })

            const apiData = await apiResponse.json()

            return apiData.id
            
        } catch(error){
            console.log(error);
            
        }
    }

    return <>
        <div className="modal" id="addPostModal">
            { displayLoader && <Loader /> }
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
                <h2 className="text-2xl mb-4">Add New Post</h2>
                <form onSubmit={ handleFormSubmitData }>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                        type="text"
                        className="border border-gray-300 rounded w-full p-2"
                        value={title}
                        onChange={ (e) => setTitle(e.target.value) }
                        required
                        />
                    </div>
            
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select value={category} onChange={ (e) => setCategory(e.target.value) } className="border border-gray-300 rounded w-full p-2" required>                        >
                            <option value="">Select Category</option>
                            {
                                Object.entries(categoriesList).map(([index, value]) => (
                                    <option value={index} key={index}>{value}</option>
                                ))
                            }
                        </select>
                    </div>
            
                    <div className="mb-4 col-span-2">
                        <label className="block text-sm font-medium mb-2">Content</label>
                        <CKEditor editor={ClassicEditor} data={editorContent} onChange={ (e, editor) => {
                            const editorData = editor.getData()
                            setEditorContent(editorData)
                        }} />
                    </div>
            
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Featured Image</label>
                        <input type="file" onChange={ (e) => setFeaturedImage(e.target.files[0]) }/>
                    </div>
            
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                        className="border border-gray-300 rounded w-full p-2"
                        required
                        value={status}
                        onChange={ (e) => setStatus(e.target.value) }
                        >
                        <option value="">- Select -</option>
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                        </select>
                    </div>
                    </div>
            
                    <div className="flex justify-end mt-4">
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
                        Submit
                    </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    </>
}

export default AddPostModal