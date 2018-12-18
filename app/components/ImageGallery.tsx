import * as React from 'react';
import { StyleSheet } from 'aphrodite';
import Lightbox from 'react-images';


const gutter = {
	small: 2,
	large: 4,
};
const classes: any = StyleSheet.create({
	gallery: {
		marginRight: -gutter.small,
        overflow: 'hidden',
        verticalAlign: "center",

		'@media (min-width: 500px)': {
			marginRight: -gutter.large,
		},
	},

	// anchor
	thumbnail: {
		boxSizing: 'border-box',
		display: 'block',
		float: 'left',
		lineHeight: 0,
		paddingRight: gutter.small,
		paddingBottom: gutter.small,
		overflow: 'hidden',

		'@media (min-width: 500px)': {
			paddingRight: gutter.large,
			paddingBottom: gutter.large,
		},
	},

	// orientation
	landscape: {
		width: '30%',
	},
	square: {
		paddingBottom: 0,
		width: '40%',

		'@media (min-width: 500px)': {
			paddingBottom: 0,
		},
	},

	// actual <img />
	source: {
		border: 0,
		display: 'block',
		height: 'auto',
		maxWidth: '300px',
		width: 'auto',
	},
});


class Gallery extends React.Component<{heading: string, images: any, showThumbnails: boolean, subheading: string}, {lightboxIsOpen: boolean, currentImage: number}> {

    state = {
        lightboxIsOpen: false,
        currentImage: 0,
    };

    public static defaultProps = {
        heading: "",
        showThumbnails: false,
        subheading: "",
    };

    constructor(props: any)
    {
      super(props);

		this.closeLightbox = this.closeLightbox.bind(this);
		this.gotoNext = this.gotoNext.bind(this);
		this.gotoPrevious = this.gotoPrevious.bind(this);
		this.gotoImage = this.gotoImage.bind(this);
		this.handleClickImage = this.handleClickImage.bind(this);
		this.openLightbox = this.openLightbox.bind(this);
    }
    

	openLightbox (index: any, event: any) {
		event.preventDefault();
		this.setState({
			currentImage: index,
			lightboxIsOpen: true,
		});
	}
	closeLightbox () {
		this.setState({
			currentImage: 0,
			lightboxIsOpen: false,
		});
	}
	gotoPrevious () {
		this.setState({
			currentImage: this.state.currentImage - 1,
		});
	}
	gotoNext () {
		this.setState({
			currentImage: this.state.currentImage + 1,
		});
	}
	gotoImage (index: any) {
		this.setState({
			currentImage: index,
		});
	}
	handleClickImage () {
		if (this.state.currentImage === this.props.images.length - 1) return;

		this.gotoNext();
	}
	renderGallery () {
		const { images } = this.props;

        if (!images)
            return <div></div>;

        console.log(classes);

		const gallery = images.map((obj: any, i:number) => {

			return (
				<a
					href={obj.src}
					key={i}
					onClick={(e) => this.openLightbox(i, e)}
				>
					<img src={obj.src} style={{
                        border: 0,
                        height: 'auto',
                        maxWidth: '300px',
                        width: '300px',
                    }} />
				</a>
			);
		});

		return (
			<div style={{
                overflow: 'hidden',
                verticalAlign: "center",
                display: "block"
                }}>
				{gallery}
			</div>
		);
	}
	render () {
		return (
			<div className="section">
				{this.props.heading && <p>{this.props.heading}</p>}
				{this.props.subheading && <p>{this.props.subheading}</p>}
				{this.renderGallery()}
				<Lightbox
					currentImage={this.state.currentImage}
					images={this.props.images}
					isOpen={this.state.lightboxIsOpen}
					onClickImage={this.handleClickImage}
					onClickNext={this.gotoNext}
					onClickPrev={this.gotoPrevious}
					onClickThumbnail={this.gotoImage}
					onClose={this.closeLightbox}
					showThumbnails={this.props.showThumbnails}
					
				/>
			</div>
		);
	}
}





export default Gallery;