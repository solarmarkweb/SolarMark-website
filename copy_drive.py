import re
import traceback

try:
    with open('frontend/src/app/page.jsx', 'r', encoding='utf-8') as f:
        page_content = f.read()

    with open('frontend/src/app/profile/page.jsx', 'r', encoding='utf-8') as f:
        profile_content = f.read()

    # Make sure API_URL is in profile/page.jsx
    if 'const API_URL =' not in profile_content:
        profile_content = profile_content.replace(
            'export default function ProfilePage() {',
            'const API_URL = process.env.NEXT_PUBLIC_API_URL || \'https://admin-backend-591983072009.asia-south1.run.app/api\';\n\nexport default function ProfilePage() {'
        )

    # Extract State from page.jsx
    states = [
        "  const [rgbFiles, setRgbFiles] = useState([]);",
        "  const [thermalFiles, setThermalFiles] = useState([]);",
        "  const [uploading, setUploading] = useState(false);",
        "  const [uploadStatus, setUploadStatus] = useState({ type: \"\", message: \"\" });",
        "  const [dragActive, setDragActive] = useState({ rgb: false, thermal: false });",
        "  const [uploadProgress, setUploadProgress] = useState({ rgb: 0, thermal: 0 });"
    ]

    # Insert states if not present
    if 'setRgbFiles' not in profile_content:
        state_insert_idx = profile_content.find('const [submittingReview, setSubmittingReview]')
        if state_insert_idx != -1:
            end_of_line = profile_content.find('\n', state_insert_idx)
            insert_str = '\n    // Google Drive Upload States\n    ' + '\n    '.join(states) + '\n'
            profile_content = profile_content[:end_of_line] + insert_str + profile_content[end_of_line:]
            print("States inserted.")

    # Extract Functions from page.jsx
    # Functions range from 'const handleDrag =' to the end of uploadSingleType
    functions_start = page_content.find('  const handleDrag =')
    functions_end = page_content.find('  const deleteImage =') # stop before deleteImage if they want
    
    if functions_start != -1 and functions_end != -1:
        functions_block = page_content[functions_start:functions_end]
        
        # We need to change 'userName' to '(user?.name || "User")'
        functions_block = functions_block.replace('userName', '(user?.name || \'User\')')
        # We also need to remove 'await fetchUserImages();' because it's not ported and not needed since profile uses fetchProfileData or nothing for this UI.
        functions_block = functions_block.replace('await fetchUserImages();', '// skip fetchUserImages here')
        
        if 'const handleDrag =' not in profile_content:
            insert_idx = profile_content.find('    const fetchProfileData = async')
            if insert_idx != -1:
                profile_content = profile_content[:insert_idx] + functions_block + '\n\n' + profile_content[insert_idx:]
                print("Functions inserted.")
            else:
                print("Could not find fetchProfileData to insert functions.")

    # Extract JSX from page.jsx
    start_tag = '{/* Image Upload Section */}'
    start_idx = page_content.find(start_tag)
    if start_idx != -1:
        # Match from {user && ( up to the matching <section> close
        tmp_idx = page_content.find('{user && (', start_idx)
        end_idx = page_content.find('        </section>', tmp_idx) + len('        </section>\n      )}')
        
        jsx_block = page_content[start_idx:end_idx]
        
        # Now adapt it for profile grid
        # We'll wrap it in a div that spans 3 columns
        wrapped_jsx = f"""
                    {{/* Google Drive Upload Components Restored */}}
                    <div className="xl:col-span-3 mt-10">
                        {jsx_block}
                    </div>
"""
        
        # Insert at the end of the grid in profile/page.jsx
        grid_end_idx = profile_content.find('                </div>\n            </div>\n\n            {/* Payment Modal')
        if grid_end_idx != -1 and 'Image Upload Section' not in profile_content:
            profile_content = profile_content[:grid_end_idx] + wrapped_jsx + profile_content[grid_end_idx:]
            print("JSX inserted.")

    with open('frontend/src/app/profile/page.jsx', 'w', encoding='utf-8') as f:
        f.write(profile_content)
    print("Updated profile/page.jsx successfully.")
except Exception as e:
    print(f"Error occurred: {e}")
    traceback.print_exc()
