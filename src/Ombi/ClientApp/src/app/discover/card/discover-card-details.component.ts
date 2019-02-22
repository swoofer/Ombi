import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IDiscoverCardResult } from "../interfaces";
import { SearchV2Service, RequestService, MessageService } from "../../services";
import { RequestType } from "../../interfaces";
import { ISearchMovieResultV2 } from "../../interfaces/ISearchMovieResultV2";
import { ISearchTvResultV2 } from "../../interfaces/ISearchTvResultV2";
import { RouterLink, Router } from "@angular/router";

@Component({
    selector: "discover-card-details",
    templateUrl: "./discover-card-details.component.html",
    styleUrls: ["./discover-card-details.component.scss"],
})
export class DiscoverCardDetailsComponent implements OnInit {

    public movie: ISearchMovieResultV2;
    public tv: ISearchTvResultV2;
    public tvCreator: string;
    public tvProducer: string;
    public loading: boolean;;
    public RequestType = RequestType;

    constructor(
        public dialogRef: MatDialogRef<DiscoverCardDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IDiscoverCardResult, private searchService: SearchV2Service,
        private requestService: RequestService, public messageService: MessageService, private router: Router) { }

    public async ngOnInit() {
        this.loading = true;
        if (this.data.type === RequestType.movie) {
            this.movie = await this.searchService.getFullMovieDetailsPromise(this.data.id);
        } else if (this.data.type === RequestType.tvShow) {
            this.tv = await this.searchService.getTvInfo(this.data.id);
            const creator = this.tv.crew.filter(tv => {
                return tv.type === "Creator";
            })[0];
            if (creator && creator.person) {
                this.tvCreator = creator.person.name;
            }
            const crewResult = this.tv.crew.filter(tv => {
                return tv.type === "Executive Producer";
            })[0]
            if (crewResult && crewResult.person) {
                this.tvProducer = crewResult.person.name;
            }
        }
        this.loading = false;
    }

    public onNoClick(): void {
        this.dialogRef.close();
    }

    public openDetails() {
        if (this.data.type === RequestType.movie) {
            this.router.navigate(['/details/movie/', this.data.id]);
        } else if (this.data.type === RequestType.tvShow) {
            this.router.navigate(['/details/tv/', this.data.id]);
        }

        this.dialogRef.close();
    }

    public async request() {
        this.loading = true;
        if (this.data.type === RequestType.movie) {
            const result = await this.requestService.requestMovie({ theMovieDbId: this.data.id, languageCode: "" }).toPromise();
            this.loading = false;

            if (result.result) {
                this.movie.requested = true;
                this.messageService.send(result.message, "Ok");
            } else {
                this.messageService.send(result.errorMessage, "Ok");
            }
        }
        this.loading = false;

        this.dialogRef.close();
    }
}