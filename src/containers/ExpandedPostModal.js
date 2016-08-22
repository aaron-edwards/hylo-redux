import React from 'react'
import { connect } from 'react-redux'
import { closeModal, fetchComments } from '../actions'
import { scrollToComment } from '../util/scrolling'
import { modalWrapperCSSId, ModalContainer } from '../components/Modal'
const { func, object, string } = React.PropTypes
import Post from '../components/Post'

@connect(({ posts }, { id }) => ({post: posts[id]}))
export default class ExpandedPostModal extends React.Component {
  static propTypes = {
    dispatch: func,
    socket: object,
    commentId: string,
    post: object
  }

  componentDidMount () {
    const { commentId, post: { id, numComments }, dispatch, socket } = this.props
    dispatch(fetchComments(id, {offset: 3}))
    .then(() => {
      if (commentId) {
        const wrapper = document.getElementById(modalWrapperCSSId)
        scrollToComment(commentId, wrapper)
      }
    })
    socket.on(`p/${id}/comment_added`, function (){
      dispatch(fetchComments(id, {offset: numComments, refresh: true}))
    })
  }

  componentWillUnmount () {
    const { socket, post: { id } } = this.props
    socket.off(`p/${id}/comment_added`)
  }

  render () {
    const { dispatch, post, commentId } = this.props
    const onCancel = () => dispatch(closeModal())
    return <ModalContainer className='modal' id='expanded-post-modal'>
      <Post expanded {...{post, commentId, onCancel}}/>
    </ModalContainer>
  }
}
